import { describe, test } from "node:test";
import assert from "node:assert/strict";
import { pickRandom } from "./shuffle.ts";

const ITEMS = ["a", "b", "c", "d", "e"] as const;

/**
 * i 回目の呼び出しで offsets[i] 番目の候補を選ばせる乱数。
 * pickRandom は `i + floor(r * (残り件数))` で相手を決めるので、区間の真ん中を返せば狙った相手になる。
 */
function scriptedRandom(offsets: readonly number[], length: number): () => number {
  let call = 0;
  return () => {
    const remaining = length - call;
    const offset = offsets[call] ?? 0;
    call++;
    return (offset + 0.5) / remaining;
  };
}

describe("pickRandom", () => {
  test("元の配列を書き換えない", () => {
    const items = [...ITEMS];
    pickRandom(items, 3);
    assert.deepEqual(items, [...ITEMS]);
  });

  test("count 件を返す", () => {
    assert.equal(pickRandom(ITEMS, 3).length, 3);
  });

  test("count が件数を超えたら全件返す", () => {
    assert.equal(pickRandom(ITEMS, 99).length, ITEMS.length);
  });

  test("count が 0 以下なら空配列を返す", () => {
    assert.deepEqual(pickRandom(ITEMS, 0), []);
    assert.deepEqual(pickRandom(ITEMS, -1), []);
  });

  test("空の配列を渡しても落ちない", () => {
    assert.deepEqual(pickRandom([], 3), []);
  });

  test("返る要素は重複せず、すべて元の配列にある", () => {
    for (let i = 0; i < 200; i++) {
      const picked = pickRandom(ITEMS, 3);
      assert.equal(new Set(picked).size, 3);
      for (const item of picked) {
        assert.ok(ITEMS.includes(item as (typeof ITEMS)[number]));
      }
    }
  });

  test("乱数が常に最小値なら元の並びのまま", () => {
    assert.deepEqual(pickRandom(ITEMS, 3, () => 0), ["a", "b", "c"]);
  });

  test("乱数が常に最大寄りなら末尾から取る", () => {
    // i=0: a↔e / i=1: b↔a / i=2: c↔b
    assert.deepEqual(pickRandom(ITEMS, 3, () => 0.999), ["e", "a", "b"]);
  });

  // 一様であることの証明。3要素の Fisher-Yates が取りうる選択は 3×2×1 の6通りしかないので、
  // それを全部走らせて6つの並びが1回ずつ出ることを確かめる。
  // 元の `.sort(() => Math.random() - 0.5)` はここで並びが偏る
  test("3要素なら6通りの並びが漏れなく1回ずつ出る", () => {
    const three = ["a", "b", "c"] as const;
    const results = new Set<string>();

    for (let k0 = 0; k0 < 3; k0++) {
      for (let k1 = 0; k1 < 2; k1++) {
        const random = scriptedRandom([k0, k1, 0], three.length);
        results.add(pickRandom(three, 3, random).join(""));
      }
    }

    assert.deepEqual([...results].sort(), ["abc", "acb", "bac", "bca", "cab", "cba"]);
  });
});
