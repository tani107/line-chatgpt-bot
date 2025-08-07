// This is a test update for Render deploy
const express = require("express");
const line = require("@line/bot-sdk");
const { Configuration, OpenAIApi } = require("openai");

const config = {
  channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.LINE_CHANNEL_SECRET
};

const openai = new OpenAIApi(
  new Configuration({
    apiKey: process.env.OPENAI_API_KEY
  })
);

const client = new line.Client(config);
const app = express();

app.use(express.json());
app.post("/webhook", line.middleware(config), async (req, res) => {
  const events = req.body.events;

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const text = event.message.text;

      try {
        const completion = await openai.createChatCompletion({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "次の日本語を英語に翻訳してください。" },
            { role: "user", content: text }
          ]
        });

        const replyText = completion.data.choices[0].message.content.trim();
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: replyText
        });
      } catch (e) {
        console.error(e);
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "翻訳に失敗しました。"
        });
      }
    }
  }

  res.status(200).end();
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
  console.log(`App is running on port ${port}`);
});
