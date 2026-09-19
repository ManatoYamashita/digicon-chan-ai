// 感情ヘッダーの解釈を1か所に集める。
// システムプロンプトは回答の1行目に感情の一文字を書かせ、クライアントはそれを見て立ち絵を切り替える。
// サーバー（遵守率の計測）とクライアント（画面の切り替え）が別々に1文字目を判定していると、
// ログに出る数字と実際の画面の挙動がずれる (#26)。

/** 立ち絵を持つ感情。システムプロンプトが書かせる一文字と対応する */
export const EMOTIONS = ["楽", "怒", "哀", "困", "照"] as const;

export type EmotionChar = (typeof EMOTIONS)[number];

/** 立ち絵の状態。default は感情が取れなかったときの既定 */
export type Emotion = EmotionChar | "default";

function isEmotionChar(value: string): value is EmotionChar {
  return (EMOTIONS as readonly string[]).includes(value);
}

/**
 * 返答の先頭から感情の一文字を取り出し、残りを本文として返す。
 *
 * 1文字目が5つのいずれでもなければ `default` を返す。これは「フォーマットが崩れた」場合と
 * 「そもそも感情が付かなかった」場合の両方を含み、区別はしない。画面ではどちらも
 * 既定の立ち絵になるため、扱いが同じで良い。
 *
 * 本文は1文字目を落とした残り全体で、改行の有無を問わない。「1行目は感情の一文字だけ」と
 * 仮定して最初の改行までを捨てると、モデルが同じ行に本文を続けたとき (例: `楽やっほー！\n…`)
 * その分が黙って消える。
 */
export function parseEmotionResponse(raw: string): { emotion: Emotion; text: string } {
  const trimmed = raw.trim();
  const firstChar = trimmed.charAt(0);
  if (isEmotionChar(firstChar)) {
    return { emotion: firstChar, text: trimmed.slice(1).trim() };
  }
  return { emotion: "default", text: trimmed };
}

/**
 * 本番ログに残す1行を組み立てる (#26)。
 *
 * 返答の本文も利用者の入力も含めない。残すのは次の3つだけ。
 * - 判定された感情、または `default`
 * - 本文が空かどうか。空の場合、画面はこの感情ではなく `困` を出してエラー表示に切り替わる
 *   （`components/chat-page.tsx` の `fail`）ので、ログと画面が一致しない行として区別する
 * - `default` のとき、感情の一文字が1行目のどこかに現れるかと、その位置。
 *   0 より大きければ「感情は書かれたが前に何かが付いている」（例: `「楽」`、`**楽`）と分かり、
 *   解析を緩める余地があるのか、そもそも感情が無いのかを、再デプロイせずに切り分けられる
 */
export function describeEmotionHeader(raw: string): string {
  const { emotion, text } = parseEmotionResponse(raw);
  const notes: string[] = [];

  if (emotion === "default") {
    const firstLine = raw.trim().split("\n", 1)[0] ?? "";
    const at = [...firstLine].findIndex((char) => isEmotionChar(char));
    notes.push(at === -1 ? "no emotion char in line 1" : `emotion char at ${at}`);
  }
  if (!text) {
    notes.push("empty body");
  }

  return notes.length > 0 ? `${emotion} (${notes.join(", ")})` : emotion;
}
