const axios = require('axios');
const tunnel = require('tunnel');

let tunnelAgent = tunnel.httpsOverHttp({
    proxy: {
        host: 'localhost',
        port: 7890
    }
});

// let requestPath = `/bot${token}/${methodName}`
// client.get(requestPath).then(r => console.log(r.data)).catch(console.error);

// let chatID = -1001401076378;
// let messageID = 1;

// let requestPath = `/bot${token}/deleteMessage`
// client.post(requestPath, {
    // "chat_id": chatID,
    // "message_id": messageID
// }).then(r => console.log(JSON.stringify(r.data))).catch(console.error);

class Bot {
    private baseURL = "https://api.telegram.org";

    private getToken() {
        return "1153495535:AAFwwL0FzrFFHJ8n0FaCc6dCTCN_vH1xyF0";
    }

    private getClient() {
        return axios.create({
            "baseURL": "https://api.telegram.org",
            "headers": {
                "Content-Type": "application/json"
            },
            "httpsAgent": tunnelAgent
        });
    }

    public async getMe() {
        return await this.getClient().get(`/bot${this.getToken()}/getMe`).then(r => r.data).catch(console.error);
    }
}

let bot = new Bot();
bot.getMe().then(d => console.log(d));