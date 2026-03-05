# DailyWear Advisor

每日穿衣建议 · AI 驱动 · 天气感知

## 功能

- 🔐 用户注册 / 登录
- 🌤️ 基于 Open-Meteo 的实时天气获取
- 🤖 AI 穿衣建议（OpenAI / DeepSeek / Groq）
- 📱 Bark 推送通知到 iPhone
- ⏰ 每日定时自动推送

## 快速开始

```bash
# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的实际值

# 初始化数据库
npx prisma db push

# 启动开发服务器
npm run dev
```

## 技术栈

- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + shadcn/ui
- Prisma + Supabase PostgreSQL
- NextAuth.js
- Open-Meteo API
- OpenAI SDK
- Bark Push
