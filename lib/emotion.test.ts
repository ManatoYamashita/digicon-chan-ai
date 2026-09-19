import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { EMOTIONS, describeEmotionHeader, parseEmotionResponse } from "./emotion.ts";

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

  // 「1行目は感情の一文字だけ」と仮定して最初の改行までを捨てると、ここで本文が消える
  test("感情と同じ行に本文が続いても、その分を落とさない", () => {
    assert.deepEqual(parseEmotionResponse("楽やっほー！\n今日はいい天気だね"), {
      emotion: "楽",
      text: "やっほー！\n今日はいい天気だね",
    });
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

describe("describeEmotionHeader", () => {
  test("整った返答は感情の一文字だけを残す", () => {
    assert.equal(describeEmotionHeader("楽\nやっほー！"), "楽");
  });

  // 本文が空のとき、画面はこの感情ではなく 困 を出す。ログと画面が一致しない行として区別する
  test("本文が空なら empty body を添える", () => {
    assert.equal(describeEmotionHeader("困"), "困 (empty body)");
  });

  test("感情が無ければ、1行目に一文字も無いことを残す", () => {
    assert.equal(describeEmotionHeader("やっほー！"), "default (no emotion char in line 1)");
  });

  // 解析を緩めれば拾える崩れ方なのかを、再デプロイせずに切り分けるための情報
  test("感情の前に何か付いている場合は、その位置を残す", () => {
    assert.equal(describeEmotionHeader("「楽」\nやっほー！"), "default (emotion char at 1)");
    assert.equal(describeEmotionHeader("**楽**\nやっほー！"), "default (emotion char at 2)");
  });

  test("2行目以降にしか感情が無い場合は、1行目に無いと記録する", () => {
    assert.equal(describeEmotionHeader("はい\n楽しいね"), "default (no emotion char in line 1)");
  });

  test("空文字は default かつ本文も空", () => {
    assert.equal(describeEmotionHeader(""), "default (no emotion char in line 1, empty body)");
  });

  test("本文にも入力にも触れない（記録に現れるのは感情と位置だけ）", () => {
    const secret = "個人情報を含む本文";
    assert.equal(describeEmotionHeader(`楽\n${secret}`).includes(secret), false);
    assert.equal(describeEmotionHeader(secret).includes(secret), false);
  });
});
