import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getWeatherByCity } from "@/lib/weather";
import { generateAdvice } from "@/lib/ai";
import { fetchOneDaily } from "@/lib/one";
import { UserPreferences } from "@/types";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as { id: string }).id },
    });

    if (!user?.city) {
      return NextResponse.json(
        { error: "请先在设置中填写城市" },
        { status: 400 }
      );
    }

    const weatherResult = await getWeatherByCity(user.city);
    const { cityName, ...weather } = weatherResult;

    // 并行获取 AI 建议和 ONE 每日一句
    const [advice, oneDaily] = await Promise.all([
      generateAdvice(weather, cityName, user.preferences as UserPreferences | null),
      fetchOneDaily(),
    ]);

    const today = new Date().toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    });

    return NextResponse.json({
      weather,
      advice,
      oneDaily,
      city: cityName,
      date: today,
    });
  } catch (error) {
    console.error("Dashboard data error:", error);
    const message = error instanceof Error ? error.message : "获取数据失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
