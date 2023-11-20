'use strict';

// ########################################
//               初期設定など
// ########################################

// モジュールの読み込み
const line = require('@line/bot-sdk');
const OpenAI = require('openai');
const express = require('express');
// const dotenv = require('dotenv'); //dotenv使うときはコメントアウト外してください
// dotenv.config();

// 設定
const config = {
  channelSecret: process.env.CHANNEL_SECRET || 'CHANNEL_SECRET',
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN || 'CHANNEL_ACCESS_TOKEN',
};

// GPTのAPIKEY
const apiKey = process.env.OPENAI_API_KEY || 'OPENAI_API_KEY';
const openai = new OpenAI({apiKey});

const makeCompletion = async (userMessage) => {
  const prompt = {
      role: "system", 
      content: "日本語のメッセージを英訳、英語のメッセージを日本語訳してください" // プロンプトを入力
  };

  const sendMessage = [prompt, userMessage]
  console.log(sendMessage);
  return await openai.chat.completions.create({
    messages: sendMessage,
    model: "gpt-3.5-turbo-1106",
  });
};

const client = new line.messagingApi.MessagingApiClient(config);
// メッセージイベントの処理
async function handleEvent(event) {
  // テキストメッセージ以外は無視
  if (event.type !== 'message' || event.message.type !== 'text') {
    return Promise.resolve(null);
  }

  const userMessage = {
    role: "user",
    content: event.message.text
  };

  // ChatGPT APIにリクエストを送る
  try {
    const completion = await makeCompletion(userMessage);
    // レスポンスから返答を取得
    console.log(completion.choices[0].message.content); // レスポンスをみたいときにコメントアウトを外してください
    const reply = completion.choices[0].message.content;
    // 返答をLINEに送る
    return client.replyMessage({
      replyToken: event.replyToken, 
      messages:[{
        type: 'text',
        text: reply
      }]
    });
  } catch (error) {
    // エラーが発生した場合はログに出力
    console.error(error);
    return Promise.resolve(null);
  }
}

// ここ以降は理解しなくてOKです
const port = process.env.PORT || 3000;
const app = express()
  .get('/', (_, res) => res.send('hello LINE Bot'))
  .post('/webhook', line.middleware(config), (req, res) => {
    if (req.body.events.length === 0) {
      res.send('Hello LINE BOT! (HTTP POST)');
      console.log('検証イベントを受信しました');
      return
    } else {
      console.log(req.body.events);
    }
    Promise
      .all(req.body.events.map(handleEvent))
      .then((result) => res.json(result));
  })
app.listen(port);
console.log(`PORT${port}番でサーバーを実行中です`)