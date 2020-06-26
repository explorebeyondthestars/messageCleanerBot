const axios = require('axios');
const tunnel = require('tunnel');
const express = require('express');
const bodyParser = require('body-parser')

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
            }
        });
    }

    public async setWebhook(url: string) {
        return await this.getClient().post(`/bot${this.getToken()}/setWebhook`, {
            "url": url
        })
        .then(r => r.data)
        .catch(console.error);
    }

    public async removeWebhook() {
        return await this.setWebhook("");
    }

    public listen(port: number) {
        let app = express();
        app.use(bodyParser.json());
        // app.use((req, res, next) => this.log(req, res, next));
        app.post("/webhook/ba2c7cb9-9e08-4784-b32a-7dca12d394df", (req, res) => this.onUpdates(req, res));
        app.listen(port, () => this.onServerStart(port));
    }

    private log(req, res, next) {
        console.log(req.body);
        next();
    }

    public async getWebhookInfo() {
        return await this.getClient().get(`/bot${this.getToken()}/getWebhookInfo`)
        .then(r => r.data)
        .catch(console.error);
    }

    private onUpdates(req, res) {
        console.log("new update");

        let received = {
            "ok": true,
            "result": true,
            "description": "we had received this message."
        };

        let update = req.body;
        let messageID = update?.message?.message_id;
        let chatType = update?.message?.chat?.type ?? "unknowType";
        let chatID = update?.message?.chat?.id;
        let chatUsername = update?.message?.chat?.username;
        let text = update?.message?.text;
        let leftChatMember = update?.message?.left_chat_member;
        let leftChatMemberID = update?.message?.left_chat_member?.id;
        let leftChatMemberUsername = update?.message?.left_chat_member?.username;
        let newChatMember = update?.message?.new_chat_member;
        let newMemberID = update?.message?.new_chat_member?.id;
        let newMemberUsername = update?.message?.new_chat_member?.username;

        if (chatType === "group" || chatType === "supergroup") {
            let msg = {
                "messageType": "group or supergroup",
                "messageID": messageID,
                "chatID": chatID,
                "chatUsername": chatUsername,
                "chatType": chatType
            };

            if (leftChatMember) {
                console.log("member left chat");
                msg["leftChatMemberID"] = leftChatMemberID;
                msg["leftChatMemberUsername"] = leftChatMemberUsername;
            }

            if (newChatMember) {
                console.log("member join chat");
                msg["newMemberID"] = newMemberID;
                msg["newMemberUsername"] = newMemberUsername;
            }

            this.deleteMessage(chatID, messageID).then(d => console.log(d));

            console.log(update);
            console.log(msg);
        }

        res.json(received);
    }

    private async deleteMessage(chatID, messageID) {
        return await this.getClient().post(`/bot${this.getToken()}/deleteMessage`, {
            "chat_id": chatID,
            "message_id": messageID
        }).then(r => r.data).catch(console.error);
    }

    private onServerStart(port) {
        console.log(`started: ${port}`);
    }

    public async getMe() {
        return await this.getClient().get(`/bot${this.getToken()}/getMe`).then(r => r.data).catch(console.error);
    }
}

let bot = new Bot();
// bot.getMe().then(d => console.log(d));

// let webHookPathUUID = `ba2c7cb9-9e08-4784-b32a-7dca12d394df`;
// let webhookPath = `https://bot.automata.best/webhook/${webHookPathUUID}`;

// bot.setWebhook(webhookPath).then(d => console.log(d));
// bot.removeWebhook().then(d => console.log(d));

bot.listen(8792);
// bot.getWebhookInfo().then(d => console.log(d));