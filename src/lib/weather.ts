import { WeatherData } from "@/types";

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
}

// WMO 天气代码描述映射
const weatherCodeMap: Record<number, string> = {
  0: "晴天",
  1: "大部晴朗",
  2: "多云",
  3: "阴天",
  45: "雾",
  48: "雾凇",
  51: "小毛毛雨",
  53: "中毛毛雨",
  55: "大毛毛雨",
  61: "小雨",
  63: "中雨",
  65: "大雨",
  71: "小雪",
  73: "中雪",
  75: "大雪",
  80: "小阵雨",
  81: "中阵雨",
  82: "大阵雨",
  95: "雷暴",
  96: "雷暴伴小冰雹",
  99: "雷暴伴大冰雹",
};

/** 通过 Open-Meteo Geocoding API 将城市名转为经纬度 */
export async function geocodeCity(city: string): Promise<GeocodingResult> {
  // 同时搜索原名和加"市"后缀，取人口最大的匹配结果
  const queries = [city];
  if (!city.endsWith("市") && !city.endsWith("县") && !city.endsWith("区")) {
    queries.push(city + "市");
  }

  let bestResult: { latitude: number; longitude: number; name: string; population: number } | null = null;

  for (const q of queries) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(q)}&count=5&language=zh`;
    const res = await fetch(url);
    if (!res.ok) continue;

    const data = await res.json();
    if (!data.results || data.results.length === 0) continue;

    for (const r of data.results) {
      const pop = r.population ?? 0;
      if (!bestResult || pop > bestResult.population) {
        bestResult = {
          latitude: r.latitude,
          longitude: r.longitude,
          name: r.name,
          population: pop,
        };
      }
    }
  }

  if (!bestResult) {
    throw new Error(`未找到城市: ${city}`);
  }

  return {
    latitude: bestResult.latitude,
    longitude: bestResult.longitude,
    name: bestResult.name,
  };
}

/** 通过 Open-Meteo Forecast API 获取当天天气 */
export async function getWeather(lat: number, lon: number): Promise<WeatherData> {
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,uv_index` +
    `&daily=temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_probability_max` +
    `&temperature_unit=celsius&wind_speed_unit=kmh&timezone=auto&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`天气 API 请求失败: ${res.status}`);
  }

  const data = await res.json();
  const current = data.current;
  const daily = data.daily;
  const weatherCode = current.weather_code as number;

  return {
    temperature: current.temperature_2m,
    apparentTemperature: current.apparent_temperature,
    temperatureMax: daily.temperature_2m_max[0],
    temperatureMin: daily.temperature_2m_min[0],
    weatherCode,
    humidity: current.relative_humidity_2m,
    windSpeed: current.wind_speed_10m,
    uvIndex: current.uv_index ?? 0,
    uvIndexMax: daily.uv_index_max?.[0] ?? 0,
    precipitationProbability: daily.precipitation_probability_max?.[0] ?? 0,
    sunrise: daily.sunrise?.[0] ?? "",
    sunset: daily.sunset?.[0] ?? "",
    description: weatherCodeMap[weatherCode] || "未知天气",
  };
}

/** 一站式：城市名 → 天气数据 */
export async function getWeatherByCity(city: string): Promise<WeatherData & { cityName: string }> {
  const geo = await geocodeCity(city);
  const weather = await getWeather(geo.latitude, geo.longitude);
  return { ...weather, cityName: geo.name };
}
