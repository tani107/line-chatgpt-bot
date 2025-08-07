// This is a test update for Render deploy
const express = require("express");
const line = require("@line/bot-sdk");
const OpenAI = require("openai");

// 環境変数でLINE設定を取得
const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

// OpenAI 初期化（timeout設定も追加）
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 10000 // 10秒以内に返答がなければ失敗させる
});

const client = new line.Client(config);
const app = express();

app.use(express.json());

app.post("/webhook", line.middleware(config), async (req, res) => {
  const events = req.body.events;
  console.log("✅ Webhook received:", events);

  // 応答を先に返して処理継続（LINEのタイムアウト防止）
  res.status(200).end();

  // 応答後、非同期で返信処理
  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const text = event.message.text;
      console.log("🟡 User message:", text);

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "次の日本語を英語に翻訳してください。" },
            { role: "user", content: text }
          ]
        });

        const replyText = completion.choices[0].message.content.trim();
        console.log("🟢 AI reply:", replyText);

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: replyText
        });
      } catch (e) {
        console.error("🔴 Error in reply:", e.message || e);

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "翻訳に失敗しました。"
        });
      }
    }
  }
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
