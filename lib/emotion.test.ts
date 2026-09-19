import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { EMOTIONS, parseEmotionResponse } from "./emotion.ts";

describe("parseEmotionResponse", () => {
  test("1行目の感情と2行目以降の本文を分ける", () => {
    assert.deepEqual(parseEmotionResponse("楽\nやっほー！"), { emotion: "楽", text: "やっほー！" });
  });

  test("5つの感情をすべて認識する", () => {
    for (const emotion of EMOTIONS) {
      assert.equal(parseEmotionResponse(`${emotion}\n本文`).emotion, emotion);
    }
  });

  test("本文が複数行でも改行を保つ", () => {
    assert.equal(parseEmotionResponse("楽\n1行目\n2行目").text, "1行目\n2行目");
  });

  test("前後の空白を無視して1文字目を見る", () => {
    assert.deepEqual(parseEmotionResponse("  \n怒\nもう！  "), { emotion: "怒", text: "もう！" });
  });

  test("改行が無くても感情の後ろを本文として扱う", () => {
    assert.deepEqual(parseEmotionResponse("照ありがと…"), { emotion: "照", text: "ありがと…" });
  });

  test("感情の一文字だけなら本文は空になる", () => {
    assert.deepEqual(parseEmotionResponse("困"), { emotion: "困", text: "" });
  });

  // ここが本番で測りたいケース。default の割合がそのまま「立ち絵が切り替わらなかった割合」になる
  test("1文字目が感情でなければ default になり、全文を本文として残す", () => {
    assert.deepEqual(parseEmotionResponse("やっほー！"), { emotion: "default", text: "やっほー！" });
  });

  test("感情の前に余計な記号が付くと default になる", () => {
    assert.equal(parseEmotionResponse("「楽」\nやっほー！").emotion, "default");
  });

  test("空文字は default で本文も空", () => {
    assert.deepEqual(parseEmotionResponse(""), { emotion: "default", text: "" });
  });
});
