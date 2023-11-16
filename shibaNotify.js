// const fetch = require('node-fetch');
async function fetchRandomShibeImage() {
    try {
        // 1から100のランダムな数を生成
        const count = Math.floor(Math.random() * 100) + 1;
        const response = await fetch(`http://shibe.online/api/shibes?count=${count}&urls=true&httpsUrls=true`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const imageUrls = await response.json();

        // 取得したURLの中からランダムに1つ選ぶ
        const randomIndex = Math.floor(Math.random() * imageUrls.length);
        const imageUrl = imageUrls[randomIndex];

        console.log(imageUrl);
        return imageUrl
    } catch (error) {
        console.error('Error fetching shibe image:', error);
    }
}
// LINE Notifyに画像を送信する関数
const sendNotify = async (message, imageUrl, access_token) => {
    const url = 'https://notify-api.line.me/api/notify';
    const headers = {
        "Content-Type": 'application/x-www-form-urlencoded',
        "Authorization": `Bearer ${access_token}`,
    };

    // 画像のURLをメッセージに追加
    const encodedMessage = `message=${encodeURIComponent(message)}&imageThumbnail=${encodeURIComponent(imageUrl)}&imageFullsize=${encodeURIComponent(imageUrl)}`;
    const res = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: encodedMessage
    });
    const result = await res.json();
    console.log(result);
}

// シバイヌの画像をランダムに取得して、LINE Notifyに送信する
async function fetchAndSendShibeImage() {
    try {
        const imageUrl = await fetchRandomShibeImage();
        if (imageUrl) {
            // LINE Notifyのアクセストークン
            const accessToken = 'gEeMNw2vIt5z0cmW8H5iY0jbdqTNEWuKlKjYLimRiJY';
            // 送信するメッセージ
            const message = '見てください、かわいいシバイヌです！';
            await sendNotify(message, imageUrl, accessToken);
            console.log("send");
        }
    } catch (error) {
        console.error('Error:', error);
    }
}

fetchAndSendShibeImage();
