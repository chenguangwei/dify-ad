# Dify Web 前端代码结构文档

> 本文档为"星渊智能体平台"品牌改造计划的第一阶段输出。

## 1. 前端目录结构树

```
web/
├── .dockerignore
├── .env.example
├── .gitignore
├── .husky/                    # Git hooks 配置
├── .npmrc
├── .nvmrc
├── .storybook/                # Storybook 组件文档配置
│   ├── __mocks__/
│   ├── main.ts
│   ├── preview.tsx
│   └── utils/
├── .vscode/                   # VS Code 配置
│   ├── extensions.json
│   ├── launch.json
│   └── settings.example.json
├── AGENTS.md / CLAUDE.md      # 项目说明文档
├── Dockerfile
├── README.md
├── __mocks__/                 # Jest mocks
├── __tests__/                 # 测试用例目录
├── app/                       # Next.js 应用主目录
│   ├── (commonLayout)/        # 通用布局路由组
│   │   ├── apps/              # 应用列表页面
│   │   ├── datasets/          # 数据集管理
│   │   ├── explore/           # 应用探索页
│   │   ├── plugins/           # 插件市场
│   │   ├── tools/             # 工具管理
│   │   ├── education-apply/   # 教育申请（待移除）
│   │   └── layout.tsx         # 通用布局
│   ├── (humanInputLayout)/    # 人工输入布局
│   │   └── form/[token]/      # 表单提交页面
│   ├── (shareLayout)/         # 分享布局路由组
│   │   ├── chat/[token]/      # 聊天分享页
│   │   ├── chatbot/[token]/   # Chatbot分享页
│   │   ├── completion/[token]/# 文本生成分享页
│   │   ├── workflow/[token]/  # 工作流分享页
│   │   ├── webapp-signin/     # Web应用登录
│   │   ├── webapp-reset-password/
│   │   ├── components/
│   │   │   ├── authenticated-layout.tsx
│   │   │   └── splash.tsx
│   │   └── layout.tsx
│   ├── account/              # 账户管理
│   │   └── (commonLayout)/
│   ├── activate/              # 账户激活
│   ├── signin/                # 控制台登录
│   ├── signup/                # 用户注册
│   ├── forgot-password/       # 忘记密码
│   ├── reset-password/        # 重置密码
│   ├── oauth-callback/        # OAuth回调
│   ├── install/               # 安装页面
│   ├── init/                  # 初始化页面
│   ├── styles/                # 全局样式
│   ├── components/            # 公共组件目录
│   │   ├── app-sidebar/       # 应用侧边栏
│   │   ├── header/            # 顶部导航
│   │   ├── base/              # 基础UI组件
│   │   │   ├── icons/         # 图标库
│   │   │   ├── chat/          # 聊天相关
│   │   │   ├── features/      # 功能面板
│   │   │   ├── modal/         # 模态框
│   │   │   ├── dropdown/      # 下拉菜单
│   │   │   ├── button/        # 按钮
│   │   │   ├── input/         # 输入框
│   │   │   ├── select/        # 选择器
│   │   │   ├── tabs/          # 标签页
│   │   │   ├── tooltip/       # 提示
│   │   │   ├── avatar/        # 头像
│   │   │   ├── file-uploader/ # 文件上传
│   │   │   ├── form/          # 表单
│   │   │   ├── date-and-time-picker/
│   │   │   ├── logo/          # Logo 组件
│   │   │   └── ...
│   │   ├── app/               # 应用配置组件
│   │   │   ├── configuration/ # 配置面板
│   │   │   ├── annotation/    # 标注功能
│   │   │   ├── overview/      # 概览
│   │   │   └── debug/         # 调试
│   │   ├── workflow/          # 工作流组件
│   │   ├── datasets/          # 数据集组件
│   │   ├── provider/          # 模型提供商
│   │   ├── share/             # 分享组件
│   │   ├── custom/            # 自定义组件
│   │   ├── plugins/           # 插件组件
│   │   ├── develop/           # 开发工具
│   │   ├── goto-anything/     # 快速导航
│   │   └── ...
│   ├── layout.tsx             # 根布局
│   └── init/                  # 初始化
├── assets/                    # 静态资源
├── bin/                       # 脚本文件
├── config/                    # 配置文件
├── constants/                 # 常量定义
├── context/                   # React Context
│   └── hooks/                 # Context Hooks
├── contract/                  # TypeScript 类型定义
│   └── console/
├── docker/                    # Docker 配置
├── docs/                      # 文档
├── eslint-rules/              # ESLint 规则
├── eslint.config.mjs
├── eslint-suppressions.json
├── hooks/                     # 自定义 Hooks
├── i18n/                      # 国际化文件
│   ├── en-US/                 # 英语
│   ├── zh-Hans/               # 简体中文
│   ├── zh-Hant/               # 繁体中文
│   ├── ja-JP/                 # 日语
│   ├── ko-KR/                 # 韩语
│   ├── de-DE/                 # 德语
│   ├── es-ES/                 # 西班牙语
│   ├── fr-FR/                 # 法语
│   ├── pt-PT/                 # 葡萄牙语
│   ├── ar-TN/                 # 阿拉伯语
│   └── i18n-config/           # 国际化配置
├── models/                    # 数据模型
├── next.config.ts             # Next.js 配置
├── package.json
├── pnpm-lock.yaml
├── postcss.config.js
├── proxy.ts                   # 代理配置
├── public/                    # 公共静态资源
│   ├── logo/                  # Logo 文件
│   ├── screenshots/           # 截图
│   ├── education/             # 教育相关图片
│   ├── favicon.ico
│   ├── manifest.json          # PWA Manifest
│   ├── apple-touch-icon.png
│   ├── browserconfig.xml
│   ├── embed.js / embed.min.js
│   ├── pdf.worker.min.mjs
│   └── vs/                    # VS Code 编辑器资源
├── scripts/                   # 构建脚本
├── service/                   # API 服务层
├── tailwind-common-config.ts
├── tailwind-css-plugin.ts
├── tailwind.config.js
├── test/                      # 测试配置
├── themes/                    # 主题样式
│   ├── dark.css
│   ├── light.css
│   ├── manual-dark.css
│   ├── manual-light.css
│   ├── markdown-dark.css
│   ├── markdown-light.css
│   └── tailwind-theme-var-define.ts
├── tsconfig.json
├── tsslint.config.ts
├── types/                     # 类型定义
├── utils/                     # 工具函数
├── vite.config.ts
├── vitest.config.ts
└── vitest.setup.ts
```

## 2. 关键文件清单

### 2.1 布局相关文件

| 文件路径 | 作用 | 改造优先级 |
|---------|------|------------|
| `web/app/layout.tsx` | Next.js 根布局文件 | 高 |
| `web/app/(commonLayout)/layout.tsx` | 控制台通用布局 | 高 |
| `web/app/(shareLayout)/layout.tsx` | 分享页面布局 | 高 |
| `web/app/signin/layout.tsx` | 登录页布局 | 高 |
| `web/app/components/app-sidebar/` | 侧边栏组件 | 中 |
| `web/app/components/header/index.tsx` | 顶部导航栏 | 高 |

### 2.2 基础 UI 组件文件

| 文件路径 | 作用 | 改造优先级 |
|---------|------|------------|
| `web/app/components/base/button/index.tsx` | 按钮组件 | 高 |
| `web/app/components/base/button/index.css` | 按钮样式 | 高 |
| `web/app/components/base/modal/index.tsx` | 模态框组件 | 高 |
| `web/app/components/base/modal/index.css` | 模态框样式 | 高 |
| `web/app/components/base/input/index.tsx` | 输入框组件 | 中 |
| `web/app/components/base/action-button/index.tsx` | 动作按钮 | 中 |
| `web/app/components/base/logo/dify-logo.tsx` | Logo 组件 | 高 |

### 2.3 样式相关文件

| 文件路径 | 作用 | 改造优先级 |
|---------|------|------------|
| `web/themes/dark.css` | 深色主题样式 | 高 |
| `web/themes/light.css` | 浅色主题样式 | 高 |
| `web/tailwind.config.js` | Tailwind CSS 配置 | 中 |
| `web/tailwind-common-config.ts` | Tailwind 通用配置 | 高 |
| `web/app/styles/globals.css` | 全局样式 | 高 |

### 2.4 国际化相关文件

| 目录/文件 | 作用 | 改造优先级 |
|----------|------|------------|
| `web/i18n/zh-Hans/` | 简体中文翻译 | 高 |
| `web/i18n/en-US/` | 英语翻译 | 中 |
| `web/i18n-config/` | 国际化配置 | 低 |

## 3. 品牌相关文件清单

### 3.1 Logo 文件（需替换）

| 文件路径 | 描述 | 操作 |
|---------|------|------|
| `web/public/logo/logo.svg` | SVG 矢量 Logo | 替换为星渊 Logo |
| `web/public/logo/logo-site.png` | 网站主 Logo | 替换 |
| `web/public/logo/logo-site-dark.png` | 深色模式 Logo | 替换 |
| `web/public/logo/logo-monochrome-white.svg` | 白色单色 Logo | 替换 |
| `web/public/logo/logo-embedded-chat-avatar.png` | 嵌入式聊天头像 | 替换 |
| `web/public/logo/logo-embedded-chat-header*.png` | 嵌入式聊天头部 Logo (3个) | 替换 |

### 3.2 Favicon 和图标（需替换）

| 文件路径 | 描述 |
|---------|------|
| `web/public/favicon.ico` | 网站图标 |
| `web/public/apple-touch-icon.png` | Apple 设备图标 |
| `web/public/icon-192x192.png` | PWA 图标 |
| `web/public/icon-512x512.png` | PWA 图标 |

### 3.3 PWA 和应用配置

| 文件路径 | 描述 | 需修改内容 |
|---------|------|----------|
| `web/public/manifest.json` | PWA 应用清单 | name, short_name, theme_color |
| `web/public/browserconfig.xml` | IE 浏览器配置 | TileColor |

### 3.4 Logo React 组件（需改造）

| 文件路径 | 描述 | 操作 |
|---------|------|------|
| `web/app/components/base/logo/dify-logo.tsx` | Logo 组件 | 重命名为 BrandLogo |
| `web/app/components/base/logo/logo-site.tsx` | 网站 Logo | 更新引用 |
| `web/app/components/base/logo/logo-embedded-chat-header.tsx` | 嵌入式聊天头部 | 验证路径 |

## 4. 需改造文件完整列表

### 4.1 品牌替换文件（第二阶段）

| 类别 | 文件 | 操作 |
|------|------|------|
| **Logo** | `web/public/logo/*` | 全部替换 |
| **Favicon** | `web/public/favicon.ico` | 替换 |
| **PWA 图标** | `web/public/icon-*.png` | 替换 |
| **Manifest** | `web/public/manifest.json` | 修改品牌信息 |
| **Meta** | `web/app/layout.tsx` | 修改 theme-color, title |
| **Logo 组件** | `web/app/components/base/logo/dify-logo.tsx` | 重命名 + 更新 |
| **标题** | `web/app/components/header/index.tsx` | Dify → 星渊智能体平台 |
| **版权** | `web/app/signin/layout.tsx` 等6个文件 | 替换版权信息 |
| **i18n** | `web/i18n/zh-Hans/*.json` | 替换 Dify → 星渊 |
| **硬编码颜色** | 多处 `#1C64F2` | 替换为品牌色 |
| **CSS 变量** | `web/themes/*.css` | 替换 dify 命名 |

### 4.2 社区链接清除文件（第二阶段）

| 文件 | 需清除内容 |
|------|-----------|
| `web/app/components/header/github-star/index.tsx` | 整个组件删除 |
| `web/app/components/header/account-dropdown/index.tsx` | GitHub 链接 |
| `web/app/components/header/account-about/index.tsx` | 开源许可、Changelog 链接 |
| `web/app/components/header/account-dropdown/support.tsx` | Discord、论坛链接 |
| `web/context/i18n.ts` | docs.dify.ai |
| `web/app/components/header/utils/util.ts` | support@dify.ai |
| `web/app/(commonLayout)/education-apply/` | 整个目录移除 |
| `web/config/index.ts` | PARTNER_STACK_CONFIG |
| `web/contract/console/billing.ts` | PartnerStack 相关 |
| `web/app/components/billing/config.ts` | contactSalesUrl, community url |

### 4.3 设计系统改造文件（第三阶段）

| 文件 | 改造内容 |
|------|----------|
| `web/app/styles/globals.css` | 添加 Apple 字体、增大圆角 |
| `web/tailwind-common-config.ts` | 更新配色、阴影、字体 |
| `web/themes/light.css` | Apple 风格配色 |
| `web/themes/dark.css` | Apple 风格配色 |

### 4.4 核心组件改造文件（第四阶段）

| 文件 | 改造内容 |
|------|----------|
| `web/app/components/base/button/index.tsx` | Apple 风格按钮 |
| `web/app/components/base/button/index.css` | 按钮样式优化 |
| `web/app/components/base/modal/index.tsx` | 毛玻璃效果 |
| `web/app/components/base/modal/index.css` | 模态框样式 |
| `web/app/components/base/action-button/index.tsx` | 交互优化 |

### 4.5 页面布局改造文件（第五阶段）

| 文件 | 改造内容 |
|------|----------|
| `web/app/components/header/index.tsx` | 毛玻璃效果 |
| `web/app/signin/layout.tsx` | Apple 风格登录页 |
| `web/app/signin/_header.tsx` | 登录页头部 |
| `web/app/signin/page.tsx` | 登录表单 |
| `web/app/components/app-sidebar/` | 侧边栏样式 |

## 5. 技术栈总结

- **框架**: Next.js 14 (App Router)
- **语言**: TypeScript
- **样式**: Tailwind CSS + CSS Modules
- **UI 组件**: 自建基础组件库
- **状态管理**: Zustand
- **国际化**: i18next
- **测试**: Vitest + Jest
- **包管理**: pnpm
- **构建**: Next.js + Vite

## 6. 改造优先级排序

| 优先级 | 阶段 | 内容 |
|--------|------|------|
| P0 | 第二阶段 | Logo、标题、版权信息替换 |
| P0 | 第二阶段 | 社区链接清除 |
| P1 | 第三阶段 | 设计系统（配色、字体） |
| P1 | 第四阶段 | 核心组件（Button、Modal） |
| P2 | 第三阶段 | 阴影、圆角系统 |
| P2 | 第五阶段 | 登录页改造 |
| P3 | 第五阶段 | 其他页面改造 |

## 7. 模型配置说明

根据计划，本改造支持默认 qwen 等开源模型自定义。在以下位置配置：

- `web/app/components/provider/` - 模型提供商组件
- `web/config/` - 模型配置
- `web/service/` - API 服务层

---

> 文档生成时间: 2026-02-12
> 对应计划文件: fizzy-honking-porcupine.md
