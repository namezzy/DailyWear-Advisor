/** 从「ONE · 一个」获取每日一句 */
export interface OneDaily {
  quote: string;
  author: string;
  imgUrl: string;
  volume: string;
}

export async function fetchOneDaily(): Promise<OneDaily> {
  try {
    const res = await fetch("http://v3.wufazhuce.com:8000/api/channel/one/0/0", {
      next: { revalidate: 3600 }, // 缓存1小时
    });

    if (!res.ok) {
      throw new Error(`ONE API 请求失败: ${res.status}`);
    }

    const json = await res.json();
    const item = json.data?.content_list?.[0];

    if (!item) {
      throw new Error("ONE API 返回数据为空");
    }

    const authorInfo = item.text_author_info;
    const authorName = authorInfo?.text_author_name || item.words_info || "";
    const authorWork = authorInfo?.text_author_work || "";
    const authorText = authorName
      ? `${authorName}${authorWork ? ` ${authorWork}` : ""}`
      : "";

    return {
      quote: item.forward || "今天也是值得期待的一天。",
      author: authorText,
      imgUrl: item.img_url || "",
      volume: item.volume || "",
    };
  } catch (error) {
    console.error("获取 ONE 每日一句失败:", error);
    return {
      quote: "生活总会在不经意间给你惊喜。",
      author: "",
      imgUrl: "",
      volume: "",
    };
  }
}
