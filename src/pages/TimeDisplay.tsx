import { useState, useEffect } from 'react';
import { Clock, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export default function TimeDisplay() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [format24, setFormat24] = useState(true);
  const [showSeconds, setShowSeconds] = useState(true);
  const [showDate, setShowDate] = useState(true);
  const [timeZone, setTimeZone] = useState('Asia/Shanghai');

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = () => {
    const options: Intl.DateTimeFormatOptions = {
      hour: '2-digit',
      minute: '2-digit',
      ...(showSeconds && { second: '2-digit' }),
      hour12: !format24,
      timeZone: timeZone
    };

    return currentTime.toLocaleTimeString('zh-CN', options);
  };

  const formatDate = () => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
      timeZone: timeZone
    };

    return currentTime.toLocaleDateString('zh-CN', options);
  };

  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2 flex items-center gap-2">
            <Clock className="h-8 w-8" />
            时间显示
          </h1>
          <p className="text-muted-foreground">在眼镜屏幕上显示当前时间</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="lg:col-span-2">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                {showDate && (
                  <div className="text-xl text-muted-foreground">
                    {formatDate()}
                  </div>
                )}
                <div className="text-8xl font-bold text-foreground font-mono">
                  {formatTime()}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                显示设置
              </CardTitle>
              <CardDescription>自定义时间显示格式</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <Label htmlFor="format24">24小时制</Label>
                <Switch
                  id="format24"
                  checked={format24}
                  onCheckedChange={setFormat24}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showSeconds">显示秒数</Label>
                <Switch
                  id="showSeconds"
                  checked={showSeconds}
                  onCheckedChange={setShowSeconds}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="showDate">显示日期</Label>
                <Switch
                  id="showDate"
                  checked={showDate}
                  onCheckedChange={setShowDate}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="timezone">时区</Label>
                <Select value={timeZone} onValueChange={setTimeZone}>
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Asia/Shanghai">北京时间</SelectItem>
                    <SelectItem value="Asia/Tokyo">东京时间</SelectItem>
                    <SelectItem value="America/New_York">纽约时间</SelectItem>
                    <SelectItem value="Europe/London">伦敦时间</SelectItem>
                    <SelectItem value="Europe/Paris">巴黎时间</SelectItem>
                    <SelectItem value="Australia/Sydney">悉尼时间</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>组件说明</CardTitle>
              <CardDescription>功能特性介绍</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>支持12/24小时制切换</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>可选择显示或隐藏秒数</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>支持多时区显示</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>实时更新，毫秒级延迟</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span>低功耗设计，适合长时间使用</span>
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
