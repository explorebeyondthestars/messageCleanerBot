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

## 现有实例

依源代码将自己申请的bot转变为消息清理机器人需要有1）域名，和2）VPS主机，若不全满足这两项条件，同样可以体验消息清理机器人的服务，以最新版桌面端Telegram为例，首先进入群组，点击图示中的框线范围，打开群组资料页面：

![群资料页面](/documentations/screenshots/tutorial/1x.png)

进入群组资料页面后点击”Add“按钮，添加成员：

![点击添加成员按钮](/documentations/screenshots/tutorial/2x.png)

在搜索框输入`@messageCleaningExpertBot`进行搜索，然后选中搜索结果右边的单选按钮：

![搜索并选中](/documentations/screenshots/tutorial/3x.png)

点击”OK“：

![点击OK](/documentations/screenshots/tutorial/4x.png)

点击”Add“按钮确认添加：

![确认添加](/documentations/screenshots/tutorial/5x.png)

现在可发现`@messageCleaningExpertBot`已位于群组成员名单中：

![已添加](/documentations/screenshots/tutorial/6x.png)

下一步要对其授权，确保`messageCleaningExpertBot`有权限删除消息，首先点击群组资料页面的”Edit“按钮：

![点击Edit按钮](/documentations/screenshots/tutorial/7x.png)

然后往下浏览，找到”Administrators“选项，点击之：

![点开Administrators列表](/documentations/screenshots/tutorial/8x.png)

在打开的页面中点击”Add Admin“

![Add Admin](/documentations/screenshots/tutorial/9x.png)

单击”消息清理机器人“

![单击消息清理机器人](/documentations/screenshots/tutorial/10x.png)

点击”Done“按钮确认添加

![确认添加](/documentations/screenshots/tutorial/11x.png)

这样就完成了消息清理机器人的部署，以后这个群组出现的进群和退群消息都会被`@messageCleaningExpertBot`自动删除．
