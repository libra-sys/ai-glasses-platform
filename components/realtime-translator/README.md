# 实时翻译组件

## 功能介绍
使用阿里云 API 实现多语言即时翻译，支持中英日韩等8种语言互译

## 功能特性
- 支持8种主流语言翻译
- 实时显示原文和译文
- 可通过蓝牙配置源语言和目标语言
- 基于阿里云通义千问 API，准确率高

## 硬件要求
- ESP32 开发板
- TFT 显示屏
- WiFi 网络连接

## 依赖库
- TFT_eSPI
- ArduinoJson (v6.x)
- HTTPClient (ESP32 内置)

## 配置说明

### WiFi 配置
```cpp
WiFi.begin("YOUR_WIFI_SSID", "YOUR_WIFI_PASSWORD");
```

### 支持语言
- zh: 中文
- en: 英语
- ja: 日语
- ko: 韩语
- es: 西班牙语
- fr: 法语
- de: 德语
- ru: 俄语

## 使用方法

### 通过蓝牙发送指令

**翻译文本**
```json
{
  "type": "TRANSLATE",
  "text": "你好世界"
}
```

**设置语言**
```json
{
  "type": "SET_LANG",
  "source": "zh",
  "target": "en"
}
```

## 版本信息
- 版本: 1.0.0
- API: 阿里云通义千问
- 更新日期: 2025-12-03
