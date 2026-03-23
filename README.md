# 家庭食材管理小程序

一个基于微信小程序云开发的家庭食材管理应用，帮助用户管理冰箱食材库存、推荐菜谱、分享美食创意。

## 项目简介

本项目是一个通过微信小程序云开发构建的家庭食材管理系统，主要功能包括：

- 🥕 **食材管理**：记录和管理家里的食材库存
- 🍳 **菜谱推荐**：根据现有食材智能推荐可制作的菜谱
- 👨‍🍳 **菜谱分享**：上传和分享个人美食创意
- 🏠 **家庭管理**：支持多用户家庭共享食材和菜谱

## 技术栈

- **前端框架**：微信小程序
- **后端服务**：微信云开发
- **数据库**：云开发数据库
- **存储服务**：云开发存储
- **云函数**：Node.js

## 项目结构

```
nonecook/
├── cloudfunctions/          # 云函数代码
│   ├── nonecookService/     # 主要业务云函数
│   └── quickstartFunctions/ # 快速启动云函数
├── miniprogram/             # 小程序前端代码
│   ├── components/          # 自定义组件
│   │   └── cloudTipModal/   # 提示弹窗组件
│   ├── images/              # 图片资源
│   │   ├── 1.png            # 首页图标
│   │   ├── 1ac.png          # 首页选中图标
│   │   ├── 2.png            # 冰箱图标
│   │   ├── 2ac.png          # 冰箱选中图标
│   │   ├── 3.png            # 菜谱图标
│   │   ├── 3ac.png          # 菜谱选中图标
│   │   ├── 4.png            # 个人中心图标
│   │   └── 4ac.png          # 个人中心选中图标
│   ├── pages/               # 页面文件
│   │   ├── index/           # 首页
│   │   ├── my-fridge/       # 我的冰箱
│   │   ├── recipe/          # 菜谱页面
│   │   ├── my-family/       # 个人中心
│   │   ├── ingredient/      # 食材管理
│   │   ├── add-recipe/      # 上传菜谱
│   │   ├── login/           # 登录页面
│   │   └── register/        # 注册页面
│   ├── app.js               # 应用入口
│   ├── app.json             # 应用配置
│   ├── app.wxss             # 全局样式
│   ├── config.example.js    # 配置示例
│   ├── config.local.js      # 本地配置
│   └── sitemap.json         # 站点地图
├── notes/                   # 项目笔记
└── project.config.json      # 项目配置
```

## 功能特性

### 1. 用户认证
- 微信登录/注册
- 家庭账号管理
- 权限控制

### 2. 食材管理
- 添加食材库存
- 修改食材数量
- 删除过期食材
- 食材分类管理

### 3. 菜谱功能
- 按食材充足情况排序
- 食材充足显示彩色
- 食材不足显示灰度
- 菜谱详情查看
- 菜谱上传和修改

### 4. 家庭共享
- 创建家庭群组
- 邀请家庭成员
- 共享食材和菜谱

### 5. 界面设计
- 底部导航栏（欢迎回家、我的冰箱、做点什么、个人中心）
- 响应式布局
- 棕色主题风格
- 流畅的页面切换

## 项目配置

1. **开发环境**
   - 微信开发者工具
   - Node.js（云函数开发）

2. **云开发配置**
   - 开通微信云开发服务
   - 创建云开发环境
   - 配置数据库集合
   - 部署云函数

3. **本地配置**
   - 复制 `config.example.js` 为 `config.local.js`
   - 修改云开发环境ID

## 数据库结构

### 食材集合 (ingredients)
```javascript
{
  _id: "食材ID",
  name: "食材名称",
  quantity: 100,
  unit: "g",
  type: "蔬菜",
  expiryDate: "2024-12-31",
  purchaseDate: "2024-12-20",
  note: "备注信息",
  creatorId: "创建者ID",
  familyId: "家庭ID",
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

### 菜谱集合 (recipes)
```javascript
{
  _id: "菜谱ID",
  name: "菜谱名称",
  image: "菜谱图片URL",
  ingredients: [
    { name: "食材1", quantity: 100, unit: "g" },
    { name: "食材2", quantity: 200, unit: "ml" }
  ],
  steps: ["步骤1", "步骤2", "步骤3"],
  creatorId: "创建者ID",
  familyId: "家庭ID",
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

### 家庭集合 (families)
```javascript
{
  _id: "家庭ID",
  name: "家庭名称",
  members: ["用户ID1", "用户ID2"],
  creatorId: "创建者ID",
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

### 用户集合 (users)
```javascript
{
  _id: "用户ID",
  openid: "微信OpenID",
  nickName: "用户昵称",
  avatarUrl: "头像URL",
  familyId: "所属家庭ID",
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

## 开发说明

### 本地开发

1. 克隆项目到本地
2. 使用微信开发者工具打开项目
3. 配置云开发环境
4. 部署云函数
5. 编译运行

### 云函数部署

```bash
# 部署云函数
wx cloud deploy function nonecookService
```

## 项目截图

![首页](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=微信小程序首页%20家庭食材管理%20棕色主题%20底部导航栏&image_size=landscape_16_9)
![我的冰箱](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=微信小程序我的冰箱页面%20食材列表%20棕色主题&image_size=landscape_16_9)
![菜谱页面](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=微信小程序菜谱页面%20食材充足显示彩色%20不足显示灰度&image_size=landscape_16_9)
![个人中心](https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=微信小程序个人中心页面%20家庭管理%20用户信息&image_size=landscape_16_9)

## 许可证

MIT License

## 贡献

欢迎提交 Issue 和 Pull Request！

## 联系方式

如有问题，请联系项目维护者。