"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Save, MapPin, Bell, Clock, User } from "lucide-react";

interface SettingsData {
  city: string;
  barkKey: string;
  pushTime: string;
  preferences: {
    gender?: string;
    coldSensitivity?: string;
  };
}

export default function SettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState<SettingsData>({
    city: "",
    barkKey: "",
    pushTime: "08:00",
    preferences: {},
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/settings");
      if (res.ok) {
        const data = await res.json();
        setSettings({
          city: data.city || "",
          barkKey: data.barkKey || "",
          pushTime: data.pushTime || "08:00",
          preferences: (data.preferences as SettingsData["preferences"]) || {},
        });
      }
    } catch {
      toast.error("加载设置失败");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(settings),
      });

      const data = await res.json();
      if (!res.ok) {
        toast.error(data.error || "保存失败");
        return;
      }

      toast.success("设置已保存 ✓");
    } catch {
      toast.error("保存失败，请稍后重试");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">设置</h1>
        <p className="text-muted-foreground mt-1">配置你的城市、推送和偏好信息</p>
      </div>

      {/* 位置设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <MapPin className="h-5 w-5 text-primary" />
            位置信息
          </CardTitle>
          <CardDescription>设置你所在的城市，用于获取天气数据</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="city">城市名称</Label>
            <Input
              id="city"
              placeholder="例如：北京、上海、深圳"
              value={settings.city}
              onChange={(e) => setSettings({ ...settings, city: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">支持中文城市名，如「杭州」「成都」</p>
          </div>
        </CardContent>
      </Card>

      {/* 推送设置 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            Bark 推送
          </CardTitle>
          <CardDescription>
            配置 Bark 推送，每天自动收到穿衣建议。
            <a
              href="https://bark.day.app"
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline ml-1"
            >
              什么是 Bark？
            </a>
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="barkKey">Bark Device Key</Label>
            <Input
              id="barkKey"
              placeholder="纯 Key 或完整地址如 https://bark.example.com/your-key"
              value={settings.barkKey}
              onChange={(e) => setSettings({ ...settings, barkKey: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pushTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              推送时间
            </Label>
            <Input
              id="pushTime"
              type="time"
              value={settings.pushTime}
              onChange={(e) => setSettings({ ...settings, pushTime: e.target.value })}
              className="w-40"
            />
            <p className="text-xs text-muted-foreground">每天在此时间自动发送穿衣建议</p>
          </div>
        </CardContent>
      </Card>

      {/* 穿衣偏好 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <User className="h-5 w-5 text-primary" />
            穿衣偏好
          </CardTitle>
          <CardDescription>可选项，帮助 AI 给出更贴合你的建议</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>性别</Label>
            <Select
              value={settings.preferences.gender || ""}
              onValueChange={(val) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, gender: val },
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">男</SelectItem>
                <SelectItem value="female">女</SelectItem>
                <SelectItem value="other">不限</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>怕冷程度</Label>
            <Select
              value={settings.preferences.coldSensitivity || ""}
              onValueChange={(val) =>
                setSettings({
                  ...settings,
                  preferences: { ...settings.preferences, coldSensitivity: val },
                })
              }
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="请选择" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">不太怕冷</SelectItem>
                <SelectItem value="medium">一般</SelectItem>
                <SelectItem value="high">非常怕冷</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Button onClick={handleSave} disabled={saving} size="lg" className="w-full sm:w-auto">
        {saving ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Save className="mr-2 h-4 w-4" />
        )}
        保存设置
      </Button>
    </div>
  );
}
