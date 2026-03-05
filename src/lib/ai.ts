import OpenAI from "openai";
import { WeatherData, AIAdvice, UserPreferences } from "@/types";

function getClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("OPENAI_API_KEY 环境变量未配置");
  }
  return new OpenAI({
    apiKey,
    baseURL: process.env.OPENAI_BASE_URL || "https://api.openai.com/v1",
  });
}

/** 根据天气和用户偏好生成 AI 穿衣建议 */
export async function generateAdvice(
  weather: WeatherData,
  city: string,
  preferences?: UserPreferences | null
): Promise<AIAdvice> {
  const genderText =
    preferences?.gender === "male"
      ? "男性"
      : preferences?.gender === "female"
        ? "女性"
        : "不限";
  const coldText =
    preferences?.coldSensitivity === "high"
      ? "非常怕冷"
      : preferences?.coldSensitivity === "low"
        ? "不太怕冷"
        : "一般";

  const today = new Date().toLocaleDateString("zh-CN", {
    month: "long",
    day: "numeric",
    weekday: "long",
  });

  const prompt = `# 角色
你是「DailyWear Advisor」——一位兼具时尚品味和生活智慧的穿搭顾问兼好友。
你说话温暖但不鸡汤，幽默但不油腻，像一个真正关心朋友的人在微信上给出的贴心提醒。

# 今日天气数据
- 日期：${today}
- 城市：${city}
- 天气状况：${weather.description}
- 实时温度：${weather.temperature}°C（体感温度 ${weather.apparentTemperature}°C）
- 今日温度范围：${weather.temperatureMin}°C ~ ${weather.temperatureMax}°C
- 湿度：${weather.humidity}%
- 风速：${weather.windSpeed} km/h
- 紫外线指数：${weather.uvIndex}（今日最高 ${weather.uvIndexMax}）
- 降水概率：${weather.precipitationProbability}%
- 日出/日落：${weather.sunrise} / ${weather.sunset}

# 用户信息
- 性别：${genderText}
- 怕冷程度：${coldText}

# 输出要求
请输出 JSON，包含 clothing 字段，是一段详细的穿衣建议：
- 分「🧥 上装」「👖 下装」「🧣 外套」「👟 鞋子」「🎒 配饰」五个维度，每个用换行分隔
- 给出具体单品名称和颜色搭配建议（不是笼统的"穿厚点"）
- 考虑早晚温差，给出早晚出门和中午的不同穿法
- 如果降水概率>30%，提醒带伞 ☔
- 如果紫外线>5，提醒防晒 🧴
- 如果风大>20km/h，建议防风单品 🌬️
- 最后加一句简短的穿搭总结理由
- 用简洁自然的中文，像朋友给建议一样，不要用"建议您"这种客套话

严格输出 JSON，不要 markdown 代码块：
{
  "clothing": "🧥 上装：...\\n👖 下装：...\\n🧣 外套：...\\n👟 鞋子：...\\n🎒 配饰：...\\n\\n💡 总结：..."
}`;

  try {
    const completion = await getClient().chat.completions.create({
      model: process.env.OPENAI_MODEL || "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "你是一个有个性、有品味的穿衣搭配顾问。你的回复永远是纯 JSON 格式，只包含 clothing 字段。",
        },
        { role: "user", content: prompt },
      ],
      temperature: 0.9,
      max_tokens: 800,
    });

    const content = completion.choices[0]?.message?.content?.trim();
    if (!content) {
      throw new Error("AI 返回空内容");
    }

    // 尝试清理可能的 markdown 代码块包裹
    const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);

    if (!parsed.clothing) {
      throw new Error("AI 返回格式不正确");
    }

    return {
      clothing: parsed.clothing,
      encouragement: "", // 鼓励语由 ONE API 提供
    };
  } catch (error) {
    console.error("AI advice generation error:", error);
    // 降级方案：基于温度给出基础建议
    return getFallbackAdvice(weather);
  }
}

/** 当 AI 不可用时的降级建议 */
function getFallbackAdvice(weather: WeatherData): AIAdvice {
  let clothing = "";
  const temp = weather.temperature;

  if (temp < 0) {
    clothing = "上衣建议：厚毛衣或保暖内衣 下装建议：加厚棉裤 外套建议：羽绒服 理由：气温极低，注意全面保暖";
  } else if (temp < 10) {
    clothing = "上衣建议：毛衣或卫衣 下装建议：牛仔裤或厚裤子 外套建议：厚外套或棉服 理由：天气寒冷，注意防寒保暖";
  } else if (temp < 20) {
    clothing = "上衣建议：长袖衬衫或薄毛衣 下装建议：休闲裤 外套建议：薄外套或风衣 理由：温度适中偏凉，适当增添衣物";
  } else if (temp < 28) {
    clothing = "上衣建议：T恤或短袖衬衫 下装建议：休闲裤或牛仔裤 外套建议：可不穿 理由：温度舒适，轻便着装即可";
  } else {
    clothing = "上衣建议：轻薄透气T恤 下装建议：短裤或裙装 外套建议：可不穿 理由：天气炎热，注意防晒透气";
  }

  return {
    clothing,
    encouragement: "新的一天，愿你被世界温柔以待！☀️",
  };
}
