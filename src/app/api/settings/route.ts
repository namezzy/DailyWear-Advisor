import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const settingsSchema = z.object({
  city: z.string().min(1, "请输入城市名称").optional(),
  barkKey: z.string().optional(),
  pushTime: z.string().regex(/^\d{2}:\d{2}$/, "格式应为 HH:MM").optional(),
  preferences: z
    .object({
      gender: z.enum(["male", "female", "other"]).optional(),
      coldSensitivity: z.enum(["low", "medium", "high"]).optional(),
    })
    .optional(),
});

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as { id: string }).id },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        barkKey: true,
        pushTime: true,
        preferences: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error("Get settings error:", error);
    return NextResponse.json({ error: "获取设置失败" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 });
    }

    const body = await req.json();
    const data = settingsSchema.parse(body);

    const user = await prisma.user.update({
      where: { id: (session.user as { id: string }).id },
      data: {
        ...(data.city !== undefined && { city: data.city }),
        ...(data.barkKey !== undefined && { barkKey: data.barkKey }),
        ...(data.pushTime !== undefined && { pushTime: data.pushTime }),
        ...(data.preferences !== undefined && { preferences: data.preferences }),
      },
      select: {
        id: true,
        email: true,
        name: true,
        city: true,
        barkKey: true,
        pushTime: true,
        preferences: true,
      },
    });

    return NextResponse.json(user);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 });
    }
    console.error("Update settings error:", error);
    return NextResponse.json({ error: "保存设置失败" }, { status: 500 });
  }
}
