// /api/gemini のレート制限。
//
// 以前は「Gemini 2.5 Flash 無料枠 10RPM」を前提に 8 RPM に絞っていたが、この前提は誤りだった。
// 実測では 120 リクエストの同時投入がすべて成功する (約 4,000 RPM 相当) ので、このキーは有料ティア。
// 上流の枠を守る必要は無い代わりに、守るものが変わる。請求である (#33)。
//
// そこで2つの窓を持つ。
// - 分あたり: 同時に触る人数の上限。イベントで数人が一斉に使っても詰まらない値にする
// - 1日あたり: 請求の上限。分あたりだけでは、低い速度で回し続けられると青天井になる
//
// この数え方はモジュールスコープのインメモリなので、Vercel の関数インスタンスごとに別々に数える。
// インスタンスが増えれば実効の上限も増えるため、厳密な保証ではなく歯止めとして置いている。

/** 分あたりの上限。イベントで一斉に使われても詰まらない値 */
export const RATE_LIMIT_RPM = 60;
/** 1日あたりの上限。請求が青天井にならないようにする歯止め */
export const RATE_LIMIT_RPD = 3000;

const MINUTE_MS = 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export type RateLimitScope = "minute" | "day";
export type RateLimitCheck =
  | { limited: false }
  | { limited: true; scope: RateLimitScope; retryAfterSeconds: number };

export type RateLimiterOptions = {
  rpm?: number;
  rpd?: number;
  /** テストから時計を差し替えるため */
  now?: () => number;
};

export type RateLimiter = {
  /** 上限に達しているかを見る。記録はしない */
  check: () => RateLimitCheck;
  /** 上流へ1回投げたことを記録する */
  record: () => void;
};

export function createRateLimiter({
  rpm = RATE_LIMIT_RPM,
  rpd = RATE_LIMIT_RPD,
  now = Date.now,
}: RateLimiterOptions = {}): RateLimiter {
  // 昇順に並んだタイムスタンプ。先頭がいちばん古い
  const timestamps: number[] = [];

  function prune(current: number): void {
    // 長いほうの窓から外れたものだけを捨てる。短いほうは数えるときに絞る
    while (timestamps.length > 0 && timestamps[0] <= current - DAY_MS) {
      timestamps.shift();
    }
  }

  /** 窓の中にある最も古いタイムスタンプ。窓が空なら undefined */
  function oldestWithin(current: number, windowMs: number): number | undefined {
    for (const t of timestamps) {
      if (t > current - windowMs) return t;
    }
    return undefined;
  }

  function countWithin(current: number, windowMs: number): number {
    let n = 0;
    for (let i = timestamps.length - 1; i >= 0; i--) {
      if (timestamps[i] <= current - windowMs) break;
      n++;
    }
    return n;
  }

  /** いちばん古い記録が窓から外れるまでの秒数。最低 1 秒を返す */
  function retryAfter(current: number, windowMs: number): number {
    const oldest = oldestWithin(current, windowMs);
    if (oldest === undefined) return 1;
    return Math.max(1, Math.ceil((oldest + windowMs - current) / 1000));
  }

  return {
    check() {
      const current = now();
      prune(current);
      // 1日の上限を先に見る。こちらに当たっているなら、分の待ち時間を返しても意味が無い
      if (countWithin(current, DAY_MS) >= rpd) {
        return { limited: true, scope: "day", retryAfterSeconds: retryAfter(current, DAY_MS) };
      }
      if (countWithin(current, MINUTE_MS) >= rpm) {
        return { limited: true, scope: "minute", retryAfterSeconds: retryAfter(current, MINUTE_MS) };
      }
      return { limited: false };
    },
    record() {
      const current = now();
      prune(current);
      timestamps.push(current);
    },
  };
}
