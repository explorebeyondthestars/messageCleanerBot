# 简易消息清理机器人

简介：一款可以自动删除电报群组入群消息和退群消息的机器人

## 部署方式

首先进入项目根目录，复制

```
cp configuration.json.sample configuration.json
```

然后打开`configuration.json`，编辑

```
{
    "apiToken": "替换成自己的bot的apiToken",
    "hostname": "替换成自己持有的用于接收webhook的域名"
}
```

然后安装依赖项并编译

```
npm install 
tsc bot.ts
```

然后运行

```
node bot.js
```

如果该机器人之前未设置过`webhook`（建议设置过的也删掉），会出现

```
webhook did not set yet, setting webhook now...
{ ok: true, result: true, description: 'Webhook was set' }
webhook was set.
{
  ok: true,
  result: {
    url: 'https://bot.automata.best/webhook/xxx',
    has_custom_certificate: false,
    pending_update_count: 0,
    max_connections: 40
  }
}
listening incoming requests that request for /webhook/xxx
started: 8792
```

根据这些输出提示，我们在网页服务器中配置反向代理，主要是将所有path为

```
/webhook/xxx
```

的请求都指向

```
:8792
```

完成以上配置后bot即部署完成．

