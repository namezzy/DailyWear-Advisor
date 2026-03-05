"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  RefreshCw,
  Send,
  Thermometer,
  Droplets,
  Wind,
  CloudSun,
  Shirt,
  Heart,
  MapPin,
  Calendar,
} from "lucide-react";
import type { DashboardData } from "@/types";
import Link from "next/link";

// 天气代码对应的 emoji
function getWeatherEmoji(code: number): string {
  if (code === 0) return "☀️";
  if (code <= 3) return "⛅";
  if (code <= 48) return "🌫️";
  if (code <= 55) return "🌦️";
  if (code <= 65) return "🌧️";
  if (code <= 75) return "❄️";
  if (code <= 82) return "🌧️";
  if (code >= 95) return "⛈️";
  return "🌤️";
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pushing, setPushing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/dashboard");
      const json = await res.json();

      if (!res.ok) {
        setError(json.error);
        return;
      }

      setData(json);
    } catch {
      setError("加载失败，请检查网络连接");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleTestPush = async () => {
    setPushing(true);
    try {
      const res = await fetch("/api/push/test", { method: "POST" });
      const json = await res.json();

      if (!res.ok) {
        toast.error(json.error || "推送失败");
        return;
      }

      toast.success("推送成功！请查看手机通知 📱");
    } catch {
      toast.error("推送请求失败");
    } finally {
      setPushing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground">正在获取天气和建议...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <CloudSun className="h-16 w-16 text-muted-foreground/50" />
        <p className="text-lg text-muted-foreground">{error}</p>
        {error.includes("城市") ? (
          <Link href="/settings">
            <Button>前往设置</Button>
          </Link>
        ) : (
          <Button onClick={fetchData} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            重试
          </Button>
        )}
      </div>
    );
  }

  if (!data) return null;

  const { weather, advice, city, date } = data;

  return (
    <div className="space-y-6">
      {/* 头部信息 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            {getWeatherEmoji(weather.weatherCode)} 今日穿衣建议
          </h1>
          <div className="flex items-center gap-3 mt-2 text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-4 w-4" />
              {city}
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {date}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          <Button onClick={fetchData} variant="outline" size="sm">
            <RefreshCw className="mr-2 h-4 w-4" />
            刷新
          </Button>
          <Button onClick={handleTestPush} disabled={pushing} size="sm">
            {pushing ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            测试推送
          </Button>
        </div>
      </div>

      {/* 天气卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-orange-500" />
            天气概况
          </CardTitle>
          <CardDescription>
            {weather.description} · 当前 {weather.temperature}°C
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center p-4 rounded-lg bg-orange-50 border border-orange-100">
              <div className="text-3xl font-bold text-orange-600">{weather.temperature}°</div>
              <div className="text-xs text-muted-foreground">体感 {weather.apparentTemperature}°</div>
              <div className="text-sm text-muted-foreground mt-1">当前温度</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-red-50 border border-red-100">
              <div className="text-2xl font-bold text-red-500">
                {weather.temperatureMin}° ~ {weather.temperatureMax}°
              </div>
              <div className="text-sm text-muted-foreground mt-1">温度范围</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-100">
              <div className="text-2xl font-bold text-blue-500 flex items-center justify-center gap-1">
                <Droplets className="h-5 w-5" />
                {weather.humidity}%
              </div>
              <div className="text-sm text-muted-foreground mt-1">湿度</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-cyan-50 border border-cyan-100">
              <div className="text-2xl font-bold text-cyan-600 flex items-center justify-center gap-1">
                <Wind className="h-5 w-5" />
                {weather.windSpeed}
              </div>
              <div className="text-sm text-muted-foreground mt-1">风速 km/h</div>
            </div>
          </div>
          {weather.precipitationProbability > 30 && (
            <div className="mt-4 p-3 rounded-lg bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm flex items-center gap-2">
              ☔ 今日降水概率 {weather.precipitationProbability}%，出门记得带伞
            </div>
          )}
          {weather.uvIndexMax > 5 && (
            <div className="mt-2 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm flex items-center gap-2">
              ☀️ 紫外线指数较高（{weather.uvIndexMax}），注意防晒
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI 穿衣建议卡片 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shirt className="h-5 w-5 text-primary" />
            AI 穿衣建议
          </CardTitle>
          <CardDescription>
            <Badge variant="secondary" className="mr-2">AI 生成</Badge>
            基于当前天气和你的偏好
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none">
            <p className="whitespace-pre-wrap leading-relaxed text-foreground">
              {advice.clothing}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 每日一句 · ONE */}
      <Card className="bg-gradient-to-r from-primary/5 to-primary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Heart className="h-6 w-6 text-primary flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-lg font-medium text-primary leading-relaxed">
                {data.oneDaily?.quote || advice.encouragement}
              </p>
              {data.oneDaily?.author && (
                <p className="text-sm text-muted-foreground mt-2">
                  —— {data.oneDaily.author}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
