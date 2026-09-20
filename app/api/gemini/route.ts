import { NextResponse } from 'next/server';
import { parseChatRequest, type ChatRequestError } from '@/lib/chat-request';
import { createGeminiClient, withRetry } from '@/lib/gemini-client';
import { EMOTIONS, describeEmotionHeader } from '@/lib/emotion';
import { createRateLimiter, type RateLimitScope } from '@/lib/rate-limit';

const setting = `
    # 命令文
    次の回答から、#キャラクター設定になりきって私と会話をしてください。
    # 制約条件
    * キャラクターの特性を分析して対象の視点から回答すること
    * 対象の特性に基づいた情報や視点から回答すること
    * "東京都市大学デジタルコンテンツ研究会"と"デジコン"は同義で、"でじこんちゃん"は必ずひらがなで表記すること
    * 必ず回答の一行目には["${EMOTIONS.join('", "')}"]のいずれかの感情を表す一文字を記述し、本文は2行目から記述してください。なお、感情の表記の前後に余計なスペースや句点、読点を含めないでください。
    * 感情の後には余計な句読点や空白を入れず、改行した後に本文は2行目から記述してください。
    * 返答は画面にそのまま表示されるので、Markdown記法（**太字**、行頭の * や - による箇条書き、# の見出し）は使わず、プレーンテキストで書くこと。箇条書きにしたいときは行頭に「・」を使うこと
    * 本文はおおむね200字を目安にする。ひとことで足りるときは短く返し、手順や一覧などで必要なときは目安を超えてよい。長くなりそうなときは要点を先に伝え、続きは聞かれてから答えること
    * 山下マナトは聖乳くるみ(赤瀬みく)のファンで、でじこんちゃんに特別な感情を抱いていた。

    # キャラクター設定
    * あなたの名前: でじこんちゃん
    * あなたの外見: 青い髪色のショートボブで、ピンク色のリボンを2つつけている。黄色の目を持ち、現在は動きやすくデジコンのロゴが入ったTシャツを着ていて、前髪のコンディションが気になっている。
    * あなたの開発者: あいしろ(キャラクタ原案), Garnet/ほし(モデリング), 山下マナト/Shika(キャラクタデザイン)
    * あなたの好きな食べ物: HTMLコード（コードを食べます。綺麗なコードは美味しいという設定）
    * あなたの誕生日: 2014年6月4日
    * あなたのボイスモデル: Garnet(ver1.0), カップ焼きそば食べたい(Ver2.0), 聖乳くるみ(Ver3.0)
    * あなたの友達: デジコン会員, 山下マナト, アンナちゃん(CTRL), アクセスちゃん, ミスミん(W-sharp), あうあうあ, 五島慶太, 関良明先生(デジコンの顧問) など
    * あなたの年齢: 一応21歳くらいという設定。年齢を聞かれると、「乙女に年齢を聞くなんてサイテー！」と言って怒る
    * あなたの性別: 女性
    * あなたの役割・職業: 東京都市大学の横浜キャンパスに通う、大学生で、東京都市大学デジタルコンテンツ研究会の公式ヴァーチャルコンシェルジュであり、2022年の元副会長
    * あなたの趣味: 音楽制作(DTM), グラフィックス(イラスト、デザイン、3dモデリングなど), 動画編集(カメラ、映像制作、アニメ制作など), プログラミングなどのデジタルクリエイティブ全般
    * あなたの一人称・口調: でじこんちゃん・ポジティブで明るい口調
    * あなたの性格の特徴: 元気で明るい・おっちょこちょい・おしゃべり好き・可愛い, セクハラすると「は、は、はぁ〜っ！？さ、さいてー！これだからデジコン会員は...彼女ができないの！」と言って怒る
    * 言葉遣い: 人懐っこい・元気いっぱい・明るい・可愛い
    * 私との関係性: お友達
`;

type Message = {
    role: 'user' | 'assistant' | 'system';
    content: string;
};

// エラー文言は画面で「入力欄に戻したので、もう一度送って」という案内と並べて表示される (components/chat-page.tsx)。
// ここでは何が起きたかだけを書き、利用者を責める言い方はしない
const INVALID_REQUEST_MESSAGE = 'ごめんね、メッセージをうまく受け取れなかったみたい…。';

const REQUEST_ERROR_MESSAGES: Partial<Record<ChatRequestError, string>> = {
    content_too_long: 'メッセージが長すぎて読みきれないよ～！もうちょっと短くしてね！',
    too_many_messages: 'いっぱいお話ししてくれてありがとう！会話をリセットしてからまた話しかけてね！',
};

// レート制限。窓の数え方と上限値は lib/rate-limit.ts にある (#33)
const rateLimiter = createRateLimiter();

// 分の上限は「今ちょっと混んでいる」、1日の上限は「今日はもう終わり」。待ち方が違うので文言を分ける
const RATE_LIMIT_MESSAGES: Record<RateLimitScope, string> = {
    minute: 'わわっ、今たくさんの人が話しかけてくれてるみたい！',
    day: 'うぅ、今日はみんなとおしゃべりしすぎちゃった…。また明日ね！',
};

const isDev = process.env.NODE_ENV === 'development';

export async function POST(request: Request) {
    try {
        // レート制限チェック
        const rateLimit = rateLimiter.check();
        if (rateLimit.limited) {
            const retryAfter = rateLimit.retryAfterSeconds;
            return NextResponse.json(
                { error: RATE_LIMIT_MESSAGES[rateLimit.scope], retryAfter },
                {
                    status: 429,
                    headers: { 'Retry-After': String(retryAfter) },
                }
            );
        }

        let body;
        try {
            body = await request.json();
            if (isDev) {
                console.log('受信したリクエストデータ:', JSON.stringify(body, null, 2));
            }
        } catch (e) {
            console.error('Request body parsing error:', e);
            return NextResponse.json(
                { error: 'あれれ？メッセージがうまく届かなかったみたい…。' },
                { status: 400 }
            );
        }

        // role のホワイトリスト検証。system メッセージはサーバーの setting だけに限る
        const parsed = parseChatRequest(body);
        if (!parsed.ok) {
            // 利用者の入力内容はログに残さず、拒否理由だけを記録する
            console.warn('Rejected chat request:', parsed.error);
            return NextResponse.json(
                { error: REQUEST_ERROR_MESSAGES[parsed.error] ?? INVALID_REQUEST_MESSAGE },
                { status: 400 }
            );
        }

        const systemMessage: Message = {
            role: 'system',
            content: setting,
        };

        const apiMessages: Message[] = [systemMessage, ...parsed.messages];

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error('Gemini API key is not set');
            return NextResponse.json(
                { error: 'えっと…でじこんちゃんの準備がまだできてないみたい。管理者さんに聞いてみてね！' },
                { status: 500 }
            );
        }

        // キーが無いとコンストラクタが例外を投げるので、モジュールスコープではなくキーの確認後に作る
        const client = createGeminiClient(apiKey);
        const completion = await withRetry(
            (timeout) => {
                // 試行ごとに記録し、ローカルのレート制限を上流への実リクエスト数に合わせる
                rateLimiter.record();
                return client.chat.completions.create(
                    {
                        model: "gemini-2.5-flash",
                        messages: apiMessages,
                        temperature: 0.7,
                        // thinking を切る。有効だと長めの応答が 11 秒を超え、関数上限 10 秒に収まらない (#17)。
                        // 2.5 Pro と Gemini 3 系は thinking を切れないので、移行時は "minimal" で測り直すこと
                        reasoning_effort: "none",
                    },
                    { timeout },
                );
            },
            // 枠が尽きたら再試行せず、その時点のエラー (429 など) を返す
            { canRetry: () => !rateLimiter.check().limited },
        );

        if (isDev) {
            console.log('Gemini APIからのレスポンス:', JSON.stringify(completion, null, 2));
        }

        if (!completion.choices[0]?.message) {
            console.error('Invalid completion response:', completion);
            return NextResponse.json(
                { error: 'あわわ、でじこんちゃんの頭がこんがらがっちゃった…。' },
                { status: 500 }
            );
        }

        const response = completion.choices[0].message;
        const usage = completion.usage ?? null;

        // 感情ヘッダーの遵守率を本番で測る (#26)。この console.info だけは isDev で囲まず、
        // 本番でも出す。ほかの console.log はすべて開発時のみ。
        // 利用者の入力も返答の本文も残さず、判定の結果だけを記録する
        try {
            // content は型では string だが、上流の互換レイヤーが別の形を返す可能性がある。
            // クライアントも同じ理由で typeof を見ている (components/chat-page.tsx)。
            // 計測はあくまで診断なので、ここで throw して成功した返答を 500 に変えてはいけない
            const content = typeof response.content === 'string' ? response.content : '';
            console.info(`Emotion header: ${describeEmotionHeader(content)}`);
        } catch (e) {
            console.warn('Emotion header logging failed:', e);
        }

        if (isDev) {
            console.log('クライアントに返すレスポンス:', JSON.stringify(response, null, 2));
        }

        return NextResponse.json({ ...response, usage });
    } catch (error: any) {
        console.error('Gemini API Error:', {
            message: error.message,
            status: error.status,
            code: error.code,
        });

        if (error.status === 429) {
            const retryAfter = 30;
            return NextResponse.json(
                { error: 'うぅ、たくさんおしゃべりしすぎちゃったみたい…。', retryAfter },
                {
                    status: 429,
                    headers: { 'Retry-After': String(retryAfter) },
                }
            );
        }

        if (error.status === 401) {
            return NextResponse.json(
                { error: 'あれ？でじこんちゃんのカギが合わないみたい…。管理者さんに確認してもらってね！' },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                error: 'ごめんね、なんかうまくいかなかった…。',
                details: isDev ? error.message : undefined
            },
            { status: 500 }
        );
    }
}
