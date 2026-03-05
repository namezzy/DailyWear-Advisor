<div align="center">

# 👔 DailyWear Advisor

**每日穿衣建议 · AI 驱动 · 天气感知 · 自动推送**

每天早上，根据你所在城市的实时天气，为你生成个性化穿衣建议，并通过 Bark 推送到 iPhone。

[![Next.js](https://img.shields.io/badge/Next.js-15-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?logo=tailwindcss)](https://tailwindcss.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2d3748?logo=prisma)](https://prisma.io/)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](https://vercel.com/)

</div>

---

## ✨ 功能亮点

| 功能 | 说明 |
|------|------|
| 🔐 **用户认证** | 邮箱注册 / 登录，基于 NextAuth.js Credentials |
| 🌤️ **实时天气** | Open-Meteo API，支持中文城市名，精准定位（智能 Geocoding） |
| 🤖 **AI 穿搭建议** | 五维度分析（上装 / 下装 / 外套 / 鞋子 / 配饰），贴心如朋友 |
| 📖 **每日一句** | 来自「ONE · 一个」的文艺句子，温暖开启每一天 |
| 📱 **Bark 推送** | 天气 + 穿搭 + 每日一句，一条推送全搞定（支持自建 Bark 服务器） |
| ⏰ **定时推送** | Vercel Cron 每小时检查，按你设定的时间准时推送 |
| 🎨 **优雅 UI** | shadcn/ui 组件库，响应式设计，深浅主题自适应 |

## 📸 推送效果预览

```
🌤️ 北京 | 多云 18.5°C（体感 16.2°C）

📊 12°~20°C | 💧45% | 🌬️8km/h

👔 今日穿搭
🧥 上装：长袖薄针织衫或卫衣
👖 下装：休闲裤或牛仔裤
🧣 外套：轻薄夹克备用，早晚温差大
👟 鞋子：帆布鞋或运动鞋
🎒 配饰：可携带薄围巾

💡 总结：昼夜温差较大，多层穿搭灵活应对

📖 追梦的人永远都走不了回头路。
    —— 林树京 from《装脏》
```

## 🏗️ 技术架构

```
┌─────────────────────────────────────────────┐
│                  Frontend                    │
│         Next.js 15 App Router               │
│     Tailwind CSS + shadcn/ui                │
├─────────────────────────────────────────────┤
│                    API                       │
│  /api/auth/*    认证（NextAuth.js）          │
│  /api/dashboard 天气 + AI 建议 + 每日一句    │
│  /api/settings  用户设置 CRUD               │
│  /api/push/test 测试推送                     │
│  /api/cron      定时任务入口                 │
├─────────────────────────────────────────────┤
│              External Services               │
│  🌤️ Open-Meteo    天气 & Geocoding          │
│  🤖 OpenAI SDK    AI 穿搭分析               │
│  📖 ONE API       每日文艺句子              │
│  📱 Bark          iPhone 推送               │
│  🐘 Supabase      PostgreSQL 数据库         │
└─────────────────────────────────────────────┘
```

## 🚀 快速开始

### 前置条件

- Node.js 18+
- [Supabase](https://supabase.com/) 账号（免费）
- [Bark](https://bark.day.app/) App（iOS）
- OpenAI / DeepSeek / Groq API Key

### 1. 克隆 & 安装

```bash
git clone https://github.com/namezzy/DailyWear-Advisor.git
cd DailyWear-Advisor
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的实际值：

```env
# Supabase PostgreSQL
DATABASE_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:PASSWORD@db.PROJECT.supabase.co:5432/postgres"

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="运行 openssl rand -base64 32 生成"

# AI（兼容 OpenAI / DeepSeek / Groq）
OPENAI_API_KEY="sk-your-api-key"
OPENAI_BASE_URL="https://api.openai.com/v1"
OPENAI_MODEL="gpt-4o-mini"

# Cron 安全密钥
CRON_SECRET="随机字符串"
```

> ⚠️ Prisma 需要单独的 `.env` 文件。复制 `DATABASE_URL` 和 `DIRECT_URL` 到 `.env`。

### 3. 初始化数据库

```bash
npx prisma db push
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 http://localhost:3000 即可使用。

## ☁️ 部署到 Vercel

1. 将代码推送到 GitHub
2. 在 [Vercel](https://vercel.com/new) 导入项目
3. 添加所有环境变量（参考 `.env.example`）
4. 部署完成后，`vercel.json` 中的 Cron Job 自动生效

```json
{
  "crons": [{ "path": "/api/cron", "schedule": "0 * * * *" }]
}
```

> Vercel Cron 每小时触发一次，系统会自动匹配用户设定的推送时间。

## 📁 项目结构

```
src/
├── app/
│   ├── (auth)/              # 登录 / 注册页面
│   ├── (main)/
│   │   ├── dashboard/       # 主页：天气 + 建议 + 每日一句
│   │   └── settings/        # 用户设置
│   └── api/
│       ├── auth/            # NextAuth 认证
│       ├── dashboard/       # Dashboard 数据接口
│       ├── settings/        # 设置 CRUD
│       ├── push/test/       # 测试推送
│       └── cron/            # 定时推送任务
├── components/
│   ├── ui/                  # shadcn/ui 组件
│   ├── navbar.tsx           # 导航栏
│   └── auth-provider.tsx    # Session Provider
├── lib/
│   ├── weather.ts           # Open-Meteo 天气 + Geocoding
│   ├── ai.ts                # AI 穿搭建议生成
│   ├── bark.ts              # Bark 推送通知
│   ├── one.ts               # ONE 每日一句
│   ├── auth.ts              # NextAuth 配置
│   ├── prisma.ts            # Prisma 客户端
│   └── utils.ts             # 工具函数
├── types/                   # TypeScript 类型定义
└── prisma/
    └── schema.prisma        # 数据库模型
```

## 🔧 自定义 Bark 服务器

支持官方 API 和自建 Bark 服务器。在设置页面的 Bark Key 字段中：

- **官方用户**：填入 Bark App 中的 Device Key（如 `abc123`）
- **自建服务器**：填入完整地址 + Key（如 `https://bark.example.com/abc123`）

## 📄 License

MIT

---

<div align="center">
  <sub>Built with ❤️ by <a href="https://github.com/namezzy">namezzy</a> · Powered by AI</sub>
</div>
