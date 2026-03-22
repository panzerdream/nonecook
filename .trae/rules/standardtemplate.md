微信小程序的标准项目结构如下,请确保项目与该模版基本一致，如有修改请告知我：

```
project-root/                # 项目根目录
├── app.js                   # [必需] 小程序逻辑入口 (必须在根目录)
├── app.json                 # [必需] 全局配置文件 (必须在根目录)
├── app.wxss                 # [可选] 全局样式表 (必须在根目录)
├── project.config.json      # [必需] 项目配置文件 (微信开发者工具生成)
├── sitemap.json             # [可选] 索引配置
├── pages/                   # [必需] 存放所有页面的文件夹
│   ├── index/               # 首页文件夹
│   │   ├── index.js         # 页面逻辑
│   │   ├── index.wxml       # 页面结构
│   │   ├── index.json       # 页面配置
│   │   └── index.wxss       # 页面样式
│   └── logs/                # 其他页面文件夹
│       ├── logs.js
│       ├── logs.wxml
│       ├── logs.json
│       └── logs.wxss
├── components/              # [推荐] 自定义组件文件夹
├── utils/                   # [推荐] 公共工具函数文件夹
└── images/                  # [推荐] 静态资源(图片)文件夹
```

由于微信小程序包大小限制，静态资源暂时存放在`images/`文件夹中。