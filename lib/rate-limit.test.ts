import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { createRateLimiter, describeRetryAfter } from "./rate-limit.ts";

/** 時計を手で進められるレート制限を作る */
function withClock(opts: { rpm?: number; rpd?: number } = {}) {
  let t = 1_000_000;
  const limiter = createRateLimiter({ ...opts, now: () => t });
  return {
    limiter,
    advance: (ms: number) => { t += ms; },
    fill: (n: number) => { for (let i = 0; i < n; i++) limiter.record(); },
  };
}

describe("createRateLimiter: 分あたりの上限", () => {
  test("上限に届くまでは通す", () => {
    const { limiter, fill } = withClock({ rpm: 3 });
    fill(2);
    assert.equal(limiter.check().limited, false);
  });

  test("上限に達したら止める", () => {
    const { limiter, fill } = withClock({ rpm: 3 });
    fill(3);
    const r = limiter.check();
    assert.equal(r.limited, true);
    assert.equal(r.limited && r.scope, "minute");
  });

  test("1分が過ぎた記録は数えない", () => {
    const { limiter, advance, fill } = withClock({ rpm: 3 });
    fill(3);
    advance(60_001);
    assert.equal(limiter.check().limited, false);
  });

  test("窓は滑る。古いものから順に空く", () => {
    const { limiter, advance, fill } = withClock({ rpm: 3 });
    fill(1);
    advance(30_000);
    fill(2);
    assert.equal(limiter.check().limited, true);
    // 最初の1件が窓から外れる
    advance(30_001);
    assert.equal(limiter.check().limited, false);
  });

  test("Retry-After は最も古い記録が外れるまでの秒数", () => {
    const { limiter, advance, fill } = withClock({ rpm: 2 });
    fill(2);
    advance(20_000);
    const r = limiter.check();
    assert.equal(r.limited, true);
    // 60 - 20 = 40 秒後に最初の1件が外れる
    assert.equal(r.limited && r.retryAfterSeconds, 40);
  });

  test("Retry-After は 0 にならない", () => {
    const { limiter, advance, fill } = withClock({ rpm: 1 });
    fill(1);
    advance(59_999);
    const r = limiter.check();
    assert.equal(r.limited && r.retryAfterSeconds, 1);
  });
});

describe("createRateLimiter: 1日あたりの上限", () => {
  test("分あたりに余裕があっても、1日の上限に達したら止める", () => {
    const { limiter, advance } = withClock({ rpm: 10, rpd: 5 });
    // 分の窓には残らない速度で回す
    for (let i = 0; i < 5; i++) { limiter.record(); advance(120_000); }
    const r = limiter.check();
    assert.equal(r.limited, true);
    assert.equal(r.limited && r.scope, "day");
  });

  test("1日の上限が先に報告される。分の待ち時間を返しても意味が無い", () => {
    const { limiter, fill } = withClock({ rpm: 3, rpd: 3 });
    fill(3);
    const r = limiter.check();
    assert.equal(r.limited && r.scope, "day");
    // 24時間近く待つ必要がある
    assert.ok(r.limited && r.retryAfterSeconds > 60);
  });

  test("24時間が過ぎた記録は数えない", () => {
    const { limiter, advance, fill } = withClock({ rpm: 10, rpd: 3 });
    fill(3);
    advance(24 * 60 * 60 * 1000 + 1);
    assert.equal(limiter.check().limited, false);
  });
});

describe("createRateLimiter: 記録の扱い", () => {
  test("check は記録しない。何度呼んでも枠を消費しない", () => {
    const { limiter, fill } = withClock({ rpm: 2 });
    fill(1);
    for (let i = 0; i < 10; i++) limiter.check();
    assert.equal(limiter.check().limited, false);
  });

  test("1日の窓から外れた記録は捨てられ、際限なく溜まらない", () => {
    const { limiter, advance, fill } = withClock({ rpm: 1000, rpd: 1000 });
    fill(10);
    advance(24 * 60 * 60 * 1000 + 1);
    fill(1);
    // 古い10件は捨てられているので、1日の上限には 1 件しか効いていない
    assert.equal(limiter.check().limited, false);
  });
});

describe("describeRetryAfter: 画面に出す待ち時間", () => {
  test("1分未満は秒で言う", () => {
    assert.equal(describeRetryAfter(1), "1秒くらい");
    assert.equal(describeRetryAfter(54), "54秒くらい");
    assert.equal(describeRetryAfter(59), "59秒くらい");
  });

  test("1分以上1時間未満は分で言う。端数は切り上げる", () => {
    assert.equal(describeRetryAfter(60), "1分くらい");
    assert.equal(describeRetryAfter(61), "2分くらい");
    assert.equal(describeRetryAfter(3599), "60分くらい");
  });

  test("1時間以上は数えない。秒の精度に意味が無いため", () => {
    assert.equal(describeRetryAfter(3600), "しばらく");
    assert.equal(describeRetryAfter(86340), "しばらく");
  });

  test("1日の上限に当たっても「86340秒くらい待って」とは言わない", () => {
    const { limiter, fill } = withClock({ rpm: 1000, rpd: 3 });
    fill(3);
    const r = limiter.check();
    assert.equal(r.limited && r.scope, "day");
    assert.equal(r.limited && describeRetryAfter(r.retryAfterSeconds), "しばらく");
  });
});
