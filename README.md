# 简易消息清理机器人

简介：一款可以自动删除电报群组入群消息和退群消息的机器人，为了应对Telegram账户长用户名中被故意植入广告且通过批量加群传播广告的滥用行为．

## 自建实例部署方式

自建实例部署具体是指通过设置webhook和部署此系统使自己控制下的机器人能够在拥有删除消息权限时具有自动删除Telegram群组入群消息和退群消息的功能．

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
    url: 'https://whatever.com/webhook/xxx',
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

## 现有实例部署方式

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

## 工作原理

当群组有新消息时，新消息（根据Telegram Bot API被抽象为所谓的"update"或称"update对象"）根据[Telegram Bot API](https://core.telegram.org/bots/api)官方提供的Webhook机制被以HTTP POST请求的方式发送到一个特定的服务器（例如yourdomain.com）的特定端口（例如443）的特点路径（例如/xxx），`bot.ts`编译成`bot.js`，并通过`node bot.js`命令启动，实际上就是启动了一个服务器（目前监听8792端口），当update到达443端口时，网页服务器例如NginX或者Apache或者Caddy会自动地将update转发到8792端口，然后我们的`bot.js`就开始处理update了：接下来，`bot.js`会从update对象中提取必要的信息，判断该update是否是因为新成员加入群组或者成员被移出群组而产生的，如果是，那么，`bot.js`会提取该加入群组提示消息/移出群组提示消息的`message_id`和`chat_id`，然后调用Telegram Bot API提供的`/deleteMessage`接口将消息予以删除．

## 常见问题

问：删除了新成员入群的消息，会影响到PolicrBot的正常工作吗？

答：经测试不会，PolicrBot可以正常工作，理论上，基于Webhook机制的验证码机器人都可以正常工作．

问：目前能够对入群成员的正常长用户名和广告长用户名做区分吗，从而只删除长用户名带广告的入群/退群消息提示而不删除正常长用户名的入群/退群提示？

答：暂时不能．暂时只会一刀切地删除所有入群/退群提示消息．

问：该机器人需要哪些权限方能正常工作？

答：至少需要成为具有「删除消息」权限的群管理员（Administrator）才能够正常工作，其他的权限暂不需要．

问：需要进行哪些额外配置吗？

答：目前暂不需要，只需邀请该机器人进入群组并授权（管理员+删除消息权限）即可，不需要进行额外的配置，全程静默工作，仅在服务器端有工作日志．

问：如果我邀请`@messageCleaningExpertBot`进群并提升为管理员，而后`@messageCleaningExpertBot`的`api_token`泄露或者其Webhook响应程序被恶意劫持和串改，可能会对我，对`@messageCleaningExpertBot`加入的群组，对`@messageCleaningExpertBot`加入的群组的群成员有何影响或危害？

答：如果运行着`@messageCleaningExpertBot`的Webhook响应程序的服务器被入侵，那么`@messageCleaningExpertBot`的工作日志会被非授权人士查看，意味着，`@messageCleaningExpertBot`所加入的群组的部分群成员的`username`,`user_id`和群组的`username`和`chat_id`会被泄露，同时，由于`api_token`泄露，并且`@messageCleaningExpertBot`具有删除消息的权限，可能导致`@messageCleaningExpertBot`所加入的群组的部分或全部消息被恶意删除，但是，如果`@messageCleaningExpertBot`仅具有「删除消息」的权限，那么影响将会仅限于此，不会有人被恶意踢出群组，群组的信息也不会被恶意修改，同时`@messageCleaningExpertBot`也不能够要求不合格的成员加入群聊（因为不具备权限），综上所述，影响范围有限且损失可控．

问：启动并部署该项目的动机是什么？

答：减少不良广告的出现，营造良好上网交流环境．

问：我能够获取`@messageCleaningExpertBot`的Webhook响应程序`bot.js`的工作日志吗？

答：请根据GitHub上显示的线索（例如项目页面的Issue或者项目创建者的电邮）联络我们，我们会尽快响应您的要求．目前，由于时间所限，暂时还不支持自助式地查看`bot.js`的工作日志．事实上，`@messageCleaningExpertBot`由于内置的逻辑极其简单，所以亦不容易出错，即使出现异常，也必将能够快速定位问题，请您放心！