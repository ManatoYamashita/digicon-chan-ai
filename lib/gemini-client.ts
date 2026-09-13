// /api/gemini から Gemini (OpenAI 互換エンドポイント) を呼ぶクライアントと再試行。
// 再試行はここの withRetry だけが行う。SDK の自動リトライと重ねると、1回の送信で上流を最大9回呼んでしまう (#13)。
import OpenAI, { APIError } from "openai";

const GEMINI_BASE_URL = "https://generativelanguage.googleapis.com/v1beta/openai/";

/** 再試行の回数。上流への試行は最大 MAX_RETRIES + 1 回 */
export const MAX_RETRIES = 2;
/**
 * 試行とバックオフを合わせた待ち時間の上限。
 * Vercel の関数上限 (10秒。Hobby で Fluid compute 無効) の1秒手前で打ち切り、JSON のエラーを返す。
 */
export const UPSTREAM_DEADLINE_MS = 9_000;
/**
 * 残り時間がこれを下回るなら再試行しない。thinking を切った応答は最大 3 秒ほどかかるため (#17)、
 * それより短い試行は応答を待ちきれず、クォータを浪費するだけになる。
 */
export const MIN_ATTEMPT_MS = 4_000;
const BASE_DELAY_MS = 1000;
const JITTER_MS = 500;

export function createGeminiClient(apiKey: string): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: GEMINI_BASE_URL,
    maxRetries: 0,
    // SDK の既定は10分。試行ごとの timeout を渡さない呼び出しも、関数上限の内側で打ち切る
    timeout: UPSTREAM_DEADLINE_MS,
  });
}

function defaultSleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type RetryOptions = {
  /** false を返すと再試行せず、直前のエラーを投げる。ローカルのレート制限枠が尽きたときに使う */
  canRetry?: () => boolean;
  /** 試行とバックオフを合わせた待ち時間の上限 */
  deadlineMs?: number;
  sleep?: (ms: number) => Promise<void>;
};

/**
 * call を指数バックオフ付きで最大 MAX_RETRIES 回まで再試行する。
 * call には締め切りまでの残り時間 (ミリ秒の整数) を渡す。SDK のリクエストオプション timeout にそのまま使える。
 */
export async function withRetry<T>(
  call: (timeoutMs: number) => Promise<T>,
  { canRetry = () => true, deadlineMs = UPSTREAM_DEADLINE_MS, sleep = defaultSleep }: RetryOptions = {},
): Promise<T> {
  const deadline = Date.now() + deadlineMs;

  for (let attempt = 0; ; attempt++) {
    try {
      return await call(deadline - Date.now());
    } catch (error) {
      // 429 (レート超過) と 503 (過負荷) だけを再試行する。タイムアウトや接続エラーは status を持たないので対象外
      const status = error instanceof APIError ? error.status : undefined;
      const retryable = status === 429 || status === 503;
      const delay = Math.round(BASE_DELAY_MS * 2 ** attempt + Math.random() * JITTER_MS);

      if (
        attempt >= MAX_RETRIES ||
        !retryable ||
        !canRetry() ||
        deadline - Date.now() - delay < MIN_ATTEMPT_MS
      ) {
        throw error;
      }

      if (process.env.NODE_ENV === "development") {
        console.log(`Gemini API retry ${attempt + 1}/${MAX_RETRIES} after ${delay}ms (status: ${status})`);
      }
      await sleep(delay);
    }
  }
}
