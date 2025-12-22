#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TFT_eSPI.h>

// 定时提醒组件配置
struct ReminderConfig {
    String serverUrl;
    unsigned long checkInterval = 30000;  // 30秒检查一次
    bool enabled = true;
};

class ReminderComponent {
private:
    ReminderConfig config;
    TFT_eSPI tft;
    unsigned long lastCheckTime = 0;
    
public:
    void begin(const char* serverUrl) {
        config.serverUrl = String(serverUrl);
        tft.init();
        tft.setRotation(1);
        tft.fillScreen(TFT_BLACK);
        tft.setTextColor(TFT_WHITE, TFT_BLACK);
        tft.setTextSize(2);
    }
    
    void loop() {
        if (!config.enabled) return;
        
        unsigned long currentTime = millis();
        if (currentTime - lastCheckTime >= config.checkInterval) {
            lastCheckTime = currentTime;
            checkReminders();
        }
    }
    
    void checkReminders() {
        if (WiFi.status() != WL_CONNECTED) {
            Serial.println("WiFi not connected");
            return;
        }
        
        HTTPClient http;
        String url = config.serverUrl + "/api/miniapp/status";
        http.begin(url);
        
        int httpCode = http.GET();
        if (httpCode == HTTP_CODE_OK) {
            String payload = http.getString();
            parseAndDisplayReminder(payload);
        }
        http.end();
    }
    
    void parseAndDisplayReminder(const String& json) {
        DynamicJsonDocument doc(2048);
        deserializeJson(doc, json);
        
        if (doc.containsKey("lastReminder")) {
            String reminderText = doc["lastReminder"]["text"].as<String>();
            if (reminderText.length() > 0) {
                displayReminder(reminderText);
            }
        }
    }
    
    void displayReminder(const String& text) {
        tft.fillScreen(TFT_BLACK);
        tft.setCursor(10, 50);
        tft.setTextColor(TFT_YELLOW, TFT_BLACK);
        tft.println("提醒:");
        tft.setCursor(10, 80);
        tft.setTextColor(TFT_WHITE, TFT_BLACK);
        tft.println(text);
        
        Serial.print("Reminder: ");
        Serial.println(text);
    }
    
    void setEnabled(bool enable) {
        config.enabled = enable;
    }
};

ReminderComponent reminder;

void setup() {
    Serial.begin(115200);
    
    // WiFi连接配置由主程序处理
    reminder.begin("http://192.168.1.100:8000");
}

void loop() {
    reminder.loop();
    delay(100);
}
