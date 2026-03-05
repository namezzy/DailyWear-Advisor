/** 通过 Bark 推送通知到用户 iPhone */
export async function sendBarkNotification(
  barkKey: string,
  title: string,
  body: string,
  options?: { icon?: string; url?: string; group?: string }
): Promise<boolean> {
  if (!barkKey) {
    console.warn("Bark key 未设置，跳过推送");
    return false;
  }

  try {
    // 支持用户填写完整 URL（如 https://bark.example.com/key）或纯 key
    let baseUrl: string;
    if (barkKey.startsWith("http://") || barkKey.startsWith("https://")) {
      // 用户填的是完整地址，去掉末尾斜杠
      baseUrl = barkKey.replace(/\/+$/, "");
    } else {
      // 纯 key，使用官方 API
      baseUrl = `https://api.day.app/${barkKey}`;
    }

    // 使用 POST JSON 方式推送（避免 URL 编码问题）
    const payload: Record<string, string> = { title, body };
    if (options?.icon) payload.icon = options.icon;
    if (options?.url) payload.url = options.url;
    if (options?.group) payload.group = options.group;

    const res = await fetch(baseUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data.code === 200) {
      console.log(`Bark 推送成功: ${title}`);
      return true;
    } else {
      console.error(`Bark 推送失败:`, data);
      return false;
    }
  } catch (error) {
    console.error("Bark 推送异常:", error);
    return false;
  }
}
