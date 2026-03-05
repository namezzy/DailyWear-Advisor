import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeatherByCity } from "@/lib/weather";
import { generateAdvice } from "@/lib/ai";
import { sendBarkNotification } from "@/lib/bark";
import { fetchOneDaily } from "@/lib/one";
import { UserPreferences } from "@/types";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as { id: string }).id },
    });

    if (!user?.city) {
      return NextResponse.json({ error: "请先设置城市" }, { status: 400 });
    }
    if (!user?.barkKey) {
      return NextResponse.json({ error: "请先设置 Bark Key" }, { status: 400 });
    }

    const weatherResult = await getWeatherByCity(user.city);
    const { cityName, ...weather } = weatherResult;

    const [advice, oneDaily] = await Promise.all([
      generateAdvice(weather, cityName, user.preferences as UserPreferences | null),
      fetchOneDaily(),
    ]);

    console.log("[TestPush] AI advice:", JSON.stringify(advice, null, 2));
    console.log("[TestPush] ONE daily:", oneDaily.quote);

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
      icon: "https://raw.githubusercontent.com/nicepkg/gpt-runner/main/docs/public/logo.svg",
    });

    if (!success) {
      return NextResponse.json({ error: "推送失败，请检查 Bark Key" }, { status: 500 });
    }

    return NextResponse.json({
      message: "推送成功！请查看手机通知",
      weather,
      advice,
    });
  } catch (error) {
    console.error("Test push error:", error);
    const message = error instanceof Error ? error.message : "推送失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
