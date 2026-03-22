该项目是一个通过trae+AI开发的微信小程序，所有的代码规范请按照微信小程序的规范进行。云开发文档请参考[微信小程序云开发文档](https://developers.weixin.qq.com/miniprogram/dev/wxcloud/basis/getting-started.html)

该项目务必要求使用尽可能简单的技术栈与框架，如有新技术的使用请告知我，尽量避免直接修改我的代码，而是通过对话框和我进行确认。

该项目必须严格遵守微信小程序的开发规范，我将把部分规范给你，其他规范如有涉及请自行查阅官方文档：[微信小程序开发规范](https://developers.weixin.qq.com/miniprogram/dev/framework/quickstart/)

部分规则：
核心强制要求（必须遵守）
主体文件必须在根目录：
小程序的三个主体文件 必须 直接放在项目的根目录下，不能放在任何子文件夹中：
app.js (必需)：小程序逻辑入口。
app.json (必需)：小程序全局配置（注册页面、配置窗口样式等）。注意：此文件不能写注释。
app.wxss (可选)：小程序全局样式表。
页面文件必须“四件套”同名同路径：
每一个页面（位于 pages 目录下）由四个文件组成，它们必须具有相同的路径和相同的文件名（仅扩展名不同）：
.js (必需)：页面逻辑。
.wxml (必需)：页面结构。
.json (可选)：页面配置。
.wxss (可选)：页面样式。
错误示例：pages/index/index.js 和 pages/index/home.wxml (文件名不一致，会报错)。
正确示例：pages/index/index.js, pages/index/index.wxml, pages/index/index.json, pages/index/index.wxss。


