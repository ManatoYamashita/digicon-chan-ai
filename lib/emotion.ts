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
 * 返答の1行目から感情の一文字を取り出し、本文と分ける。
 *
 * 1文字目が5つのいずれでもなければ `default` を返す。これは「フォーマットが崩れた」場合と
 * 「そもそも感情が付かなかった」場合の両方を含み、区別はしない。画面ではどちらも
 * 既定の立ち絵になるため、扱いが同じで良い。
 */
export function parseEmotionResponse(raw: string): { emotion: Emotion; text: string } {
  const trimmed = raw.trim();
  const firstChar = trimmed.charAt(0);
  if (isEmotionChar(firstChar)) {
    const newlineIndex = trimmed.indexOf("\n");
    const text = newlineIndex !== -1 ? trimmed.slice(newlineIndex + 1).trim() : trimmed.slice(1).trim();
    return { emotion: firstChar, text };
  }
  return { emotion: "default", text: trimmed };
}
