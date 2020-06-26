const axios = require('axios');
const tunnel = require('tunnel');
const express = require('express');
const bodyParser = require('body-parser');
import * as util from "util";
import * as fs from "fs";
const { base64encode, base64decode } = require('nodejs-base64');

let configuration = null;

class Bot {

    private baseURL = "https://api.telegram.org";

    private async getConfigurationFromFile() {
        let configurationFilePath = __dirname + "/configuration.json";
        let reader = util.promisify(fs.readFile);
        return await reader(configurationFilePath, "utf8").then(d => JSON.parse(d)).catch(error => {
            console.error(error);
            return null;
        });
    }

    public async getConfig(): Promise<any> {
        if (!configuration) {
            configuration = await this.getConfigurationFromFile();
        }

        return configuration;
    }

    private async getToken() {
        let config = await this.getConfig();
        if (config === null) {
            console.log("can't load apiToken, exiting now");
            process.exit(1);
        }

        return config.apiToken;
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
        let token = await this.getToken();
        return await this.getClient().post(`/bot${token}/setWebhook`, {
            "url": url
        })
        .then(r => r.data)
        .catch(console.error);
    }

    public async removeWebhook() {
        return await this.setWebhook("");
    }

    private async getHostname() {
        let config = await this.getConfig();
        let hostname = config?.hostname;

        if (!hostname) {
            console.log("can't get hostname, exiting now...");
            process.exit(1);
        }

        return hostname;
    }

    public async listen(port: number) {
        let webhookURL = await this.getWebhookURL();
        let token = await this.getToken();
        let webhookPath = '';

        if (webhookURL !== '') {
            console.log(`current webhook is ${webhookURL}.`);
            let urlObject = new URL(webhookURL);
            webhookPath = urlObject.pathname;
        }
        else {
            console.log("webhook did not set yet, setting webhook now...");
            let hostname = await this.getHostname();
            webhookPath = `/webhook/${base64encode(token)}`;
            webhookURL = `https://${hostname}${webhookPath}`;
            await this.setWebhook(webhookURL).then(d => {
                console.log(d);
                console.log("webhook was set.");
            });

        }

        await this.getWebhookInfo().then(d => console.log(d));
        console.log(`listening incoming requests that request for ${webhookPath}`);

        let app = express();
        app.use(bodyParser.json());
        // app.use((req, res, next) => this.log(req, res, next));
        app.post(webhookPath, (req, res) => this.onUpdates(req, res));
        app.listen(port, () => this.onServerStart(port));
    }

    private log(req, res, next) {
        console.log(req.body);
        next();
    }

    public async getWebhookInfo() {
        let token = await this.getToken();
        return await this.getClient().get(`/bot${token}/getWebhookInfo`)
        .then(r => r.data)
        .catch(console.error);
    }

    public async getWebhookURL() {
        let url = await this.getWebhookInfo().then(d => d?.result?.url);
        return url;
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
                this.deleteMessage(chatID, messageID).then(d => console.log(d));
            }

            if (newChatMember) {
                console.log("member join chat");
                msg["newMemberID"] = newMemberID;
                msg["newMemberUsername"] = newMemberUsername;
                this.deleteMessage(chatID, messageID).then(d => console.log(d));
            }


            console.log(update);
            console.log(msg);
        }

        res.json(received);
    }

    private async deleteMessage(chatID, messageID) {
        let token = await this.getToken();
        return await this.getClient().post(`/bot${token}/deleteMessage`, {
            "chat_id": chatID,
            "message_id": messageID
        }).then(r => r.data).catch(console.error);
    }

    private onServerStart(port) {
        console.log(`started: ${port}`);
    }

    public async getMe() {
        let token = await this.getToken();
        return await this.getClient().get(`/bot${token}/getMe`).then(r => r.data).catch(console.error);
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


// bot.getConfig();

// bot.getMe().then(d => console.log(d));