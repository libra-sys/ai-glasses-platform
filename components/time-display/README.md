# 时间显示组件

## 功能介绍
在智能眼镜屏幕上实时显示当前时间和日期

## 功能特性
- 支持 12/24 小时制切换
- 可选择显示或隐藏秒数
- 显示完整日期和星期
- 自动 NTP 时间同步
- 低功耗设计

## 硬件要求
- ESP32 开发板
- TFT 显示屏
- WiFi 网络连接

## 安装说明

### 1. 依赖库
需要安装以下 Arduino 库：
- TFT_eSPI

### 2. 配置 WiFi
修改代码中的 WiFi 信息：
```cpp
WiFi.begin("YOUR_WIFI_SSID", "YOUR_WIFI_PASSWORD");
```

### 3. 上传代码
使用 Arduino IDE 将代码上传到 ESP32

## 使用方法

### 通过小程序控制
小程序会通过蓝牙发送以下格式的指令：

**更新配置**
```json
{
  "type": "COMPONENT_UPDATE",
  "componentId": "time-display",
  "config": {
    "format24": true,
    "showSeconds": true
  }
}
```

### 配置参数
- `format24`: true=24小时制, false=12小时制
- `showSeconds`: true=显示秒数, false=隐藏秒数

## 版本信息
- 版本: 1.0.0
- 作者: 官方团队
- 更新日期: 2025-12-03
