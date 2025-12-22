#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TFT_eSPI.h>

// 导航组件配置
struct NavigationConfig {
    String serverUrl;
    unsigned long updateInterval = 5000;  // 5秒更新一次
    bool enabled = true;
    float currentLat = 0.0;
    float currentLng = 0.0;
};

class NavigationComponent {
private:
    NavigationConfig config;
    TFT_eSPI tft;
    unsigned long lastUpdateTime = 0;
    String currentInstruction = "";
    
public:
    void begin(const char* serverUrl) {
        config.serverUrl = String(serverUrl);
        tft.init();
        tft.setRotation(1);
        tft.fillScreen(TFT_BLACK);
        tft.setTextColor(TFT_WHITE, TFT_BLACK);
        tft.setTextSize(2);
        displayStatus("导航已启动");
    }
    
    void loop() {
        if (!config.enabled) return;
        
        unsigned long currentTime = millis();
        if (currentTime - lastUpdateTime >= config.updateInterval) {
            lastUpdateTime = currentTime;
            updateNavigation();
        }
    }
    
    void updateNavigation() {
        if (WiFi.status() != WL_CONNECTED) {
            displayStatus("WiFi未连接");
            return;
        }
        
        HTTPClient http;
        String url = config.serverUrl + "/api/miniapp/status";
        http.begin(url);
        
        int httpCode = http.GET();
        if (httpCode == HTTP_CODE_OK) {
            String payload = http.getString();
            parseNavigationData(payload);
        } else {
            displayStatus("获取导航信息失败");
        }
        http.end();
    }
    
    void parseNavigationData(const String& json) {
        DynamicJsonDocument doc(4096);
        DeserializationError error = deserializeJson(doc, json);
        
        if (error) {
            Serial.println("JSON解析失败");
            return;
        }
        
        // 更新当前位置（来自手机GPS）
        if (doc.containsKey("mobile_location")) {
            JsonObject loc = doc["mobile_location"];
            if (!loc["lat"].isNull() && !loc["lng"].isNull()) {
                config.currentLat = loc["lat"];
                config.currentLng = loc["lng"];
            }
        }
        
        // 显示导航指令
        if (doc.containsKey("navigation")) {
            JsonObject nav = doc["navigation"];
            if (nav.containsKey("instruction")) {
                String instruction = nav["instruction"].as<String>();
                displayInstruction(instruction);
            }
            
            // 显示距离
            if (nav.containsKey("distance")) {
                int distance = nav["distance"];
                displayDistance(distance);
            }
        }
    }
    
    void displayStatus(const String& status) {
        tft.fillScreen(TFT_BLACK);
        tft.setCursor(10, 50);
        tft.setTextColor(TFT_GREEN, TFT_BLACK);
        tft.println(status);
        Serial.println(status);
    }
    
    void displayInstruction(const String& instruction) {
        if (instruction == currentInstruction) return;
        
        currentInstruction = instruction;
        tft.fillScreen(TFT_BLACK);
        tft.setCursor(10, 30);
        tft.setTextColor(TFT_CYAN, TFT_BLACK);
        tft.println("导航指引:");
        tft.setCursor(10, 60);
        tft.setTextColor(TFT_WHITE, TFT_BLACK);
        tft.setTextSize(2);
        
        // 分行显示长文本
        int lineWidth = 15;  // 每行显示字符数
        for (int i = 0; i < instruction.length(); i += lineWidth) {
            String line = instruction.substring(i, min(i + lineWidth, (int)instruction.length()));
            tft.println(line);
        }
        
        Serial.print("Navigation: ");
        Serial.println(instruction);
    }
    
    void displayDistance(int distance) {
        tft.setCursor(10, 140);
        tft.setTextColor(TFT_YELLOW, TFT_BLACK);
        tft.setTextSize(2);
        
        if (distance < 1000) {
            tft.print("距离: ");
            tft.print(distance);
            tft.println("米");
        } else {
            float km = distance / 1000.0;
            tft.print("距离: ");
            tft.print(km, 1);
            tft.println("公里");
        }
    }
    
    void startNavigation(float destLat, float destLng) {
        HTTPClient http;
        String url = config.serverUrl + "/api/miniapp/navigation/start";
        http.begin(url);
        http.addHeader("Content-Type", "application/json");
        
        DynamicJsonDocument doc(512);
        doc["destination"]["lat"] = destLat;
        doc["destination"]["lng"] = destLng;
        doc["mode"] = "walking";
        
        String jsonStr;
        serializeJson(doc, jsonStr);
        
        int httpCode = http.POST(jsonStr);
        if (httpCode == HTTP_CODE_OK) {
            displayStatus("导航已开始");
        }
        http.end();
    }
    
    void stopNavigation() {
        HTTPClient http;
        String url = config.serverUrl + "/api/miniapp/navigation/stop";
        http.begin(url);
        
        int httpCode = http.POST("");
        if (httpCode == HTTP_CODE_OK) {
            displayStatus("导航已停止");
        }
        http.end();
    }
    
    void setEnabled(bool enable) {
        config.enabled = enable;
        if (!enable) {
            displayStatus("导航已关闭");
        }
    }
};

NavigationComponent navigation;

void setup() {
    Serial.begin(115200);
    
    // WiFi连接配置由主程序处理
    navigation.begin("http://192.168.1.100:8000");
}

void loop() {
    navigation.loop();
    delay(100);
}
