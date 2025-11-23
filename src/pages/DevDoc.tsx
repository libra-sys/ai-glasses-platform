import { Code, Download, Layers, Zap } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function DevDoc() {
  return (
    <div className="min-h-screen bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-2">组件开发规范</h1>
          <p className="text-muted-foreground">学习如何为 AI 眼镜平台开发组件</p>
        </div>

        <Tabs defaultValue="structure" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="structure">组件结构</TabsTrigger>
            <TabsTrigger value="protocol">通信协议</TabsTrigger>
            <TabsTrigger value="example">代码示例</TabsTrigger>
            <TabsTrigger value="api">API接口</TabsTrigger>
          </TabsList>

          <TabsContent value="structure">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Layers className="h-5 w-5" />
                  组件结构定义
                </CardTitle>
                <CardDescription>组件的基本结构和字段说明</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-2">必填字段</h3>
                  <ul className="space-y-2 text-sm">
                    <li><code className="bg-muted px-2 py-1 rounded">id</code> - 组件唯一标识符</li>
                    <li><code className="bg-muted px-2 py-1 rounded">name</code> - 组件名称</li>
                    <li><code className="bg-muted px-2 py-1 rounded">description</code> - 组件描述</li>
                    <li><code className="bg-muted px-2 py-1 rounded">version</code> - 版本号 (如 1.0.0)</li>
                    <li><code className="bg-muted px-2 py-1 rounded">author</code> - 作者信息</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">组件类型</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="border border-border rounded p-3">
                      <div className="font-medium">显示类 (display)</div>
                      <p className="text-sm text-muted-foreground">在眼镜屏幕上显示信息</p>
                    </div>
                    <div className="border border-border rounded p-3">
                      <div className="font-medium">传感器类 (sensor)</div>
                      <p className="text-sm text-muted-foreground">读取传感器数据</p>
                    </div>
                    <div className="border border-border rounded p-3">
                      <div className="font-medium">交互类 (interactive)</div>
                      <p className="text-sm text-muted-foreground">响应用户操作</p>
                    </div>
                    <div className="border border-border rounded p-3">
                      <div className="font-medium">网络类 (network)</div>
                      <p className="text-sm text-muted-foreground">网络数据交互</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="protocol">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  蓝牙通信协议
                </CardTitle>
                <CardDescription>小程序与ESP32眼镜的通信格式</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">安装组件指令</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "type": "COMPONENT_INSTALL",
  "componentId": "component-001",
  "componentName": "时间显示",
  "config": {
    "updateInterval": 1000,
    "displayFormat": "HH:mm:ss"
  },
  "enabled": true
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">卸载组件指令</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "type": "COMPONENT_UNINSTALL",
  "componentId": "component-001"
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">更新配置指令</h3>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "type": "COMPONENT_UPDATE",
  "componentId": "component-001",
  "config": {
    "updateInterval": 2000
  }
}`}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="example">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Code className="h-5 w-5" />
                  ESP32 代码示例
                </CardTitle>
                <CardDescription>完整的组件代码模板</CardDescription>
              </CardHeader>
              <CardContent>
                <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`#include <Arduino.h>
#include <ArduinoJson.h>

class TimeDisplayComponent {
private:
  String componentId = "component-001";
  int updateInterval = 1000;
  unsigned long lastUpdate = 0;
  
public:
  void init() {
    Serial.println("时间显示组件初始化");
  }
  
  void loop() {
    unsigned long now = millis();
    if (now - lastUpdate >= updateInterval) {
      displayTime();
      lastUpdate = now;
    }
  }
  
  void displayTime() {
    // 显示当前时间
    Serial.println("当前时间: " + getTime());
  }
  
  String getTime() {
    // 获取时间逻辑
    return "12:30:45";
  }
  
  void handleBleCommand(String command) {
    StaticJsonDocument<256> doc;
    deserializeJson(doc, command);
    
    String type = doc["type"];
    if (type == "COMPONENT_UPDATE") {
      updateInterval = doc["config"]["updateInterval"];
    }
  }
};

TimeDisplayComponent timeDisplay;

void setup() {
  Serial.begin(115200);
  timeDisplay.init();
}

void loop() {
  timeDisplay.loop();
}`}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="api">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Download className="h-5 w-5" />
                  上传API
                </CardTitle>
                <CardDescription>如何将组件上传到平台</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">发布组件</h3>
                  <p className="text-sm text-muted-foreground mb-2">POST /api/components</p>
                  <pre className="bg-muted p-4 rounded-lg overflow-x-auto text-sm">
{`{
  "name": "时间显示",
  "description": "在眼镜屏幕上显示当前时间",
  "category": "productivity",
  "version": "1.0.0",
  "file_url": "组件文件URL",
  "image_url": "封面图URL"
}`}
                  </pre>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">开发限制</h3>
                  <ul className="space-y-2 text-sm">
                    <li>• 组件大小不超过 5MB</li>
                    <li>• 更新频率不超过 60Hz</li>
                    <li>• 避免阻塞主循环</li>
                    <li>• 使用异步方式处理网络请求</li>
                    <li>• 合理使用内存和电量</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
