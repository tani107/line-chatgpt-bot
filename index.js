app.post("/webhook", line.middleware(config), async (req, res) => {
  const events = req.body.events;
  console.log("Received events:", events); // ← 追加！

  for (const event of events) {
    if (event.type === "message" && event.message.type === "text") {
      const text = event.message.text;
      console.log("User said:", text); // ← 追加！

      try {
        const completion = await openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            { role: "system", content: "次の日本語を英語に翻訳してください。" },
            { role: "user", content: text }
          ]
        });

        const replyText = completion.choices[0].message.content.trim();
        console.log("AI replied:", replyText); // ← 追加！

        await client.replyMessage(event.replyToken, {
          type: "text",
          text: replyText
        });
      } catch (e) {
        console.error("Error occurred:", e); // ← 追加！
        await client.replyMessage(event.replyToken, {
          type: "text",
          text: "翻訳に失敗しました。"
        });
      }
    }
  }

  res.status(200).end(); // 忘れずに！
});
