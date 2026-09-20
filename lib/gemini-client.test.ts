import { describe, test } from "node:test";
import assert from "node:assert/strict";
import type OpenAI from "openai";
import { APIConnectionTimeoutError } from "openai";
import {
  MAX_RETRIES,
  MIN_ATTEMPT_MS,
  UPSTREAM_DEADLINE_MS,
  createGeminiClient,
  withRetry,
  type RetryOptions,
} from "./gemini-client.ts";

const COMPLETION = {
  id: "chatcmpl-test",
  object: "chat.completion",
  created: 0,
  model: "gemini-2.5-flash",
  choices: [
    { index: 0, message: { role: "assistant", content: "楽\nやっほー！" }, finish_reason: "stop" },
  ],
};

// 上流の代わりに、呼ばれた回数を数えながら statuses を順に返す fetch。末尾の status を繰り返す
function mockUpstream(...statuses: number[]) {
  const upstream = {
    calls: 0,
    fetch: async () => {
      const status = statuses[Math.min(upstream.calls, statuses.length - 1)];
      upstream.calls++;
      const body = status === 200 ? COMPLETION : { error: { code: status, message: "mock error" } };
      // retry-after: 0 を付けておく。SDK の自動リトライが復活しても待たずに終わり、回数の差でテストが落ちる
      return new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json", "retry-after": "0" },
      });
    },
  };
  return upstream;
}

// 本物の SDK クライアントの fetch だけを差し替える (maxRetries と timeout は引き継がれる)
function clientWith(fetch: typeof globalThis.fetch) {
  return createGeminiClient("test-key").withOptions({ fetch });
}

// ルートと同じく、試行ごとの残り時間を SDK の timeout に渡して1回送信する
function send(client: OpenAI, options: RetryOptions = {}) {
  return withRetry(
    (timeout) =>
      client.chat.completions.create(
        { model: "gemini-2.5-flash", messages: [{ role: "user", content: "こんにちは" }] },
        { timeout },
      ),
    { sleep: async () => {}, ...options },
  );
}

describe("createGeminiClient", () => {
  test("SDK の自動リトライを止め、タイムアウトを明示する", () => {
    const client = createGeminiClient("test-key");
    assert.equal(client.maxRetries, 0);
    assert.equal(client.timeout, UPSTREAM_DEADLINE_MS);
  });
});

describe("withRetry: 再試行の回数", () => {
  test("上流が常に 429 でも、上流への試行は3回で止まる (#13)", async () => {
    const upstream = mockUpstream(429);
    await assert.rejects(send(clientWith(upstream.fetch)), { status: 429 });
    assert.equal(upstream.calls, MAX_RETRIES + 1);
  });

  test("503 の後に成功したら、その応答を返す", async () => {
    const upstream = mockUpstream(503, 200);
    const completion = await send(clientWith(upstream.fetch));
    assert.equal(completion.choices[0].message.content, "楽\nやっほー！");
    assert.equal(upstream.calls, 2);
  });

  // 500 は以前 SDK の自動リトライが拾っていたが、ルート側では再試行しない
  for (const status of [400, 500]) {
    test(`${status} は再試行しない`, async () => {
      const upstream = mockUpstream(status);
      await assert.rejects(send(clientWith(upstream.fetch)), { status });
      assert.equal(upstream.calls, 1);
    });
  }

  test("canRetry が false なら再試行しない", async () => {
    const upstream = mockUpstream(429);
    await assert.rejects(send(clientWith(upstream.fetch), { canRetry: () => false }), {
      status: 429,
    });
    assert.equal(upstream.calls, 1);
  });
});

describe("withRetry: 締め切り", () => {
  test("バックオフ後の残り時間が MIN_ATTEMPT_MS に届かなければ再試行しない", async () => {
    const upstream = mockUpstream(429);
    await assert.rejects(send(clientWith(upstream.fetch), { deadlineMs: MIN_ATTEMPT_MS }), {
      status: 429,
    });
    assert.equal(upstream.calls, 1);
  });

  test("上流が応答しなければ締め切りで打ち切り、再試行しない", async () => {
    let calls = 0;
    // abort されるまで応答しない上流
    const hang = (_input: unknown, init?: RequestInit) => {
      calls++;
      const signal = init?.signal;
      return new Promise<Response>((_, reject) => {
        signal?.addEventListener("abort", () => reject(signal.reason));
      });
    };

    const startedAt = Date.now();
    await assert.rejects(send(clientWith(hang), { deadlineMs: 50 }), APIConnectionTimeoutError);
    assert.equal(calls, 1);
    // クライアント既定の UPSTREAM_DEADLINE_MS ではなく、試行ごとに渡した残り時間で打ち切られている
    assert.ok(Date.now() - startedAt < 1000);
  });
});
