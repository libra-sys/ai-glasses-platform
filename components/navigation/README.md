# 导航组件

## 功能描述

基于手机定位的智能导航组件。由于ESP32眼镜没有GPS模块，本组件通过小程序上报手机定位，实现实时导航功能。

## 核心特性

- **手机定位**: 使用微信小程序的GPS定位替代硬件GPS
- **实时导航**: 服务器计算路线，眼镜显示导航指令
- **组件驱动**: 通过安装/卸载组件控制导航功能开关
- **多种模式**: 支持步行、过马路、红绿灯检测等场景
- **语音播报**: 关键路口自动语音提示

## 配置说明

### 组件配置格式

```json
{
  "featureType": "mobile_navigation",
  "navigation": {
    "mode": "walking",
    "voiceEnabled": true,
    "updateInterval": 5000
  }
}
```

### 字段说明

- `featureType`: 固定为 `"mobile_navigation"` 或 `"navigation_with_mobile_location"`
- `navigation.mode`: 导航模式
  - `walking`: 步行导航
  - `crossing`: 过马路检测
  - `traffic_light`: 红绿灯识别
- `navigation.voiceEnabled`: 是否启用语音播报
- `navigation.updateInterval`: 位置更新间隔（毫秒）

## 使用方式

### 1. 安装组件

1. 在网站发布组件时，配置 `config.featureType = "mobile_navigation"`
2. 小程序同步并安装组件
3. 服务器自动启用导航功能（`mobile_nav_enabled = True`）

### 2. 启动导航

小程序端调用：
```javascript
GlassesServerAPI.startNavigation({
  destination: {
    lat: 31.23,
    lng: 121.47
  },
  mode: 'walking'
});
```

### 3. 位置上报

小程序在设备管理页面后台自动上报定位：
- 每30秒获取手机GPS
- 调用 `/api/miniapp/location/update` 上报
- 服务器更新 `mobile_location` 全局变量

### 4. 导航显示

眼镜端：
- 每5秒轮询服务器状态
- 接收导航指令和距离信息
- TFT屏幕显示导航提示
- 关键路口语音播报

### 5. 停止导航

小程序端调用：
```javascript
GlassesServerAPI.stopNavigation();
```

## 卸载组件

在小程序中卸载组件后，服务器会自动：
- 关闭导航功能（`mobile_nav_enabled = False`）
- 清空手机定位数据
- 拒绝后续位置上报请求

## API 接口

### 位置上报
```
POST /api/miniapp/location/update
{
  "lat": 31.23,
  "lng": 121.47,
  "accuracy": 10
}
```

### 启动导航
```
POST /api/miniapp/navigation/start
{
  "destination": {"lat": 31.23, "lng": 121.47},
  "mode": "walking"
}
```

### 停止导航
```
POST /api/miniapp/navigation/stop
```

### 获取状态
```
GET /api/miniapp/status
返回包含:
{
  "mobile_location": {
    "lat": 31.23,
    "lng": 121.47,
    "accuracy": 10,
    "updated_at": 1703123456
  },
  "navigation": {
    "instruction": "前方200米右转",
    "distance": 200
  }
}
```

## 硬件要求

- ESP32 开发板
- TFT 显示屏
- WiFi 连接
- 配对的微信小程序（提供GPS定位）

## 技术实现

### 服务器端

```python
# 全局变量
mobile_nav_enabled = False
mobile_location = {
    "lat": None,
    "lng": None,
    "accuracy": None,
    "updated_at": None
}

# 组件安装时启用
def apply_component_effects(comp):
    if comp.get("config", {}).get("featureType") == "mobile_navigation":
        global mobile_nav_enabled
        mobile_nav_enabled = True
        
# 组件卸载时关闭
def remove_component_effects(comp):
    if comp.get("config", {}).get("featureType") == "mobile_navigation":
        global mobile_nav_enabled, mobile_location
        mobile_nav_enabled = False
        mobile_location = {"lat": None, "lng": None}
```

### 小程序端

```javascript
// 设备管理页面后台上报定位
startLocationUpload() {
  setInterval(() => {
    wx.getLocation({
      type: 'gcj02',
      success: (res) => {
        GlassesServerAPI.updateLocation(
          res.latitude, 
          res.longitude, 
          res.accuracy
        );
      }
    });
  }, 30000); // 每30秒
}
```

## 导航模式说明

### 步行导航 (walking)
- 常规路线规划
- 实时路况播报
- 转弯提示

### 过马路检测 (crossing)
- 检测前方路口
- 红绿灯识别
- 安全提醒

### 红绿灯识别 (traffic_light)
- 摄像头识别红绿灯
- 语音播报灯色
- 倒计时提示

## 注意事项

- 需要小程序授权定位权限
- WiFi连接需稳定
- 定位精度依赖手机GPS
- 服务器需保持运行
- 仅在安装组件后接受位置上报
