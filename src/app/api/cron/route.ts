import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getWeatherByCity } from "@/lib/weather";
import { generateAdvice } from "@/lib/ai";
import { sendBarkNotification } from "@/lib/bark";
import { fetchOneDaily } from "@/lib/one";
import { UserPreferences } from "@/types";

/** Vercel Cron: 每天执行一次，遍历所有用户生成推送 */
export async function GET(req: NextRequest) {
  // 验证 Cron 密钥
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) {
    console.error("CRON_SECRET 未配置");
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const results: { email: string; success: boolean; error?: string }[] = [];

  try {
    // 获取当前 UTC 小时，筛选匹配 pushTime 的用户
    const now = new Date();
    const utcHour = String(now.getUTCHours()).padStart(2, "0");
    const utcMinute = String(now.getUTCMinutes()).padStart(2, "0");
    const currentTime = `${utcHour}:${utcMinute}`;

    // 获取所有设置了城市和 Bark Key 的用户，按 pushTime 过滤（精确到小时）
    const users = await prisma.user.findMany({
      where: {
        city: { not: null },
        barkKey: { not: null },
        pushTime: { startsWith: utcHour },
      },
    });

    console.log(`Cron: 开始处理 ${users.length} 位用户的推送`);

    // 获取一次 ONE 每日一句（所有用户共享）
    const oneDaily = await fetchOneDaily();

    for (const user of users) {
      try {
        if (!user.city || !user.barkKey) continue;

        const weatherResult = await getWeatherByCity(user.city);
        const { cityName, ...weather } = weatherResult;
        const advice = await generateAdvice(
          weather,
          cityName,
          user.preferences as UserPreferences | null
        );

        const title = `${cityName} | ${weather.description} ${weather.temperature}°C（体感${weather.apparentTemperature}°C）`;
        const bodyParts = [
          `📊 ${weather.temperatureMin}°~${weather.temperatureMax}°C | 💧${weather.humidity}% | 🌬️${weather.windSpeed}km/h`,
        ];
        if (weather.precipitationProbability > 30) {
          bodyParts.push(`☔ 降水概率 ${weather.precipitationProbability}%，记得带伞`);
        }
        bodyParts.push(
          ``,
          `👔 今日穿搭`,
          advice.clothing,
          ``,
          `📖 ${oneDaily.quote}`,
        );
        if (oneDaily.author) {
          bodyParts.push(`    —— ${oneDaily.author}`);
        }
        const body = bodyParts.join("\n");

        const success = await sendBarkNotification(user.barkKey, title, body, {
          group: "DailyWear",
        });

        results.push({ email: user.email, success });
      } catch (error) {
        const errMsg = error instanceof Error ? error.message : "未知错误";
        console.error(`Cron: 用户 ${user.email} 推送失败:`, errMsg);
        results.push({ email: user.email, success: false, error: errMsg });
      }
    }

    const successCount = results.filter((r) => r.success).length;
    console.log(`Cron: 完成! 成功 ${successCount}/${results.length}`);

    return NextResponse.json({
      message: `已处理 ${results.length} 位用户，成功 ${successCount} 位`,
      results,
    });
  } catch (error) {
    console.error("Cron error:", error);
    return NextResponse.json({ error: "Cron 执行失败" }, { status: 500 });
  }
}
