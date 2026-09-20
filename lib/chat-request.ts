// /api/gemini のリクエスト契約。クライアントとサーバーで共有する。
// Node の型ストリップで直接テストするため、import を持たない純粋なモジュールに保つ。

/** 1セッションで送信できるユーザーメッセージの数 */
export const MAX_PROMPTS = 5;
/** 5回目の送信時の履歴 (user 5件 + bot 4件) が最大 */
export const MAX_MESSAGES = MAX_PROMPTS * 2 - 1;
/** ユーザー入力の上限 (UTF-16 コード単位。textarea の maxLength と同じ基準) */
export const MAX_USER_CONTENT_LENGTH = 1000;
/** bot 履歴の上限。モデル出力の長さは制御できないため、超過分は拒否せず切り詰める */
export const MAX_BOT_CONTENT_LENGTH = 4000;

export type ChatRequestError =
  | "invalid_body"
  | "invalid_role"
  | "invalid_content"
  | "content_too_long"
  | "too_many_messages"
  | "last_not_user";

export type UpstreamMessage = {
  role: "user" | "assistant";
  content: string;
};

export type ChatRequestResult =
  | { ok: true; messages: UpstreamMessage[] }
  | { ok: false; error: ChatRequestError };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/**
 * リクエストボディを検証し、上流へ送れる形に正規化する。
 * role は正規クライアントが送る "user" / "bot" だけを受け付け、"system" などは拒否する。
 */
export function parseChatRequest(body: unknown): ChatRequestResult {
  if (!isRecord(body) || !Array.isArray(body.messages) || body.messages.length === 0) {
    return { ok: false, error: "invalid_body" };
  }
  if (body.messages.length > MAX_MESSAGES) {
    return { ok: false, error: "too_many_messages" };
  }

  const messages: UpstreamMessage[] = [];
  for (const msg of body.messages) {
    if (!isRecord(msg)) {
      return { ok: false, error: "invalid_body" };
    }
    if (msg.role !== "user" && msg.role !== "bot") {
      return { ok: false, error: "invalid_role" };
    }
    // 配列 (マルチモーダルの parts) や null を通さないよう、文字列に限定する
    if (typeof msg.content !== "string" || msg.content.trim() === "") {
      return { ok: false, error: "invalid_content" };
    }

    if (msg.role === "user") {
      if (msg.content.length > MAX_USER_CONTENT_LENGTH) {
        return { ok: false, error: "content_too_long" };
      }
      messages.push({ role: "user", content: msg.content });
    } else {
      // 拒否すると以降の送信がすべて失敗するため、切り詰めて受け入れる。
      // 境界でサロゲートペアが割れた場合は toWellFormed で U+FFFD に置き換える。
      const content =
        msg.content.length > MAX_BOT_CONTENT_LENGTH
          ? msg.content.slice(0, MAX_BOT_CONTENT_LENGTH).toWellFormed()
          : msg.content;
      messages.push({ role: "assistant", content });
    }
  }

  if (messages.filter((m) => m.role === "user").length > MAX_PROMPTS) {
    return { ok: false, error: "too_many_messages" };
  }
  // 末尾に assistant を置くと応答の書き出しを誘導できるため、必ず user で終わらせる
  if (messages[messages.length - 1].role !== "user") {
    return { ok: false, error: "last_not_user" };
  }

  return { ok: true, messages };
}
