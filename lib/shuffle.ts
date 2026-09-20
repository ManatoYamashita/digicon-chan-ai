// 配列からランダムに数件を選ぶ。
//
// もとは `[...items].sort(() => Math.random() - 0.5)` と書いていたが、これは2つの理由で使えない。
//
// 1. 比較関数が一貫していないので、一様なシャッフルにならない。同じ2つを比べるたびに違う答えを
//    返すため、並びはソートの実装 (V8 は TimSort) の都合に引きずられ、元の並びが強く残る
// 2. これをモジュールスコープで呼ぶと、サーバーとクライアントで別々の抽選が走って
//    ハイドレーション不一致になる (#37)。呼ぶ側はマウント後に呼ぶこと

/**
 * 元の配列を変えずに、重複なく count 件を選んで返す。
 *
 * Fisher-Yates を先頭 count 件ぶんだけ回す。全体を並べ替えてから切り出すのと結果は同じで、
 * 交換の回数だけが少ない。
 *
 * @param random テストから乱数を差し替えるため。0 以上 1 未満を返すこと
 */
export function pickRandom<T>(
  items: readonly T[],
  count: number,
  random: () => number = Math.random
): T[] {
  const picked = [...items];
  const size = Math.min(Math.max(Math.trunc(count), 0), picked.length);

  for (let i = 0; i < size; i++) {
    // i 以降からひとつ選んで、i 番目と入れ替える
    const j = i + Math.floor(random() * (picked.length - i));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked.slice(0, size);
}
