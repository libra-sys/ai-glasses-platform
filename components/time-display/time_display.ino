#include <Arduino.h>
#include <WiFi.h>
#include <time.h>
#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI();

class TimeDisplayComponent {
private:
    const char* ntpServer = "pool.ntp.org";
    const long gmtOffset_sec = 28800;
    const int daylightOffset_sec = 0;
    bool format24Hour = true;
    bool showSeconds = true;
    unsigned long lastUpdate = 0;
    const int updateInterval = 1000;

public:
    void init() {
        tft.init();
        tft.setRotation(1);
        tft.fillScreen(TFT_BLACK);
        tft.setTextColor(TFT_WHITE, TFT_BLACK);
        
        configTime(gmtOffset_sec, daylightOffset_sec, ntpServer);
        
        Serial.println("时间显示组件已初始化");
    }

    void loop() {
        unsigned long now = millis();
        if (now - lastUpdate >= updateInterval) {
            displayTime();
            lastUpdate = now;
        }
    }

    void displayTime() {
        struct tm timeinfo;
        if (!getLocalTime(&timeinfo)) {
            tft.fillScreen(TFT_BLACK);
            tft.setTextSize(2);
            tft.setCursor(20, 60);
            tft.println("Time Error");
            return;
        }

        tft.fillScreen(TFT_BLACK);
        
        tft.setTextSize(1);
        tft.setCursor(10, 20);
        char dateStr[32];
        strftime(dateStr, sizeof(dateStr), "%Y-%m-%d %A", &timeinfo);
        tft.println(dateStr);
        
        tft.setTextSize(4);
        tft.setCursor(10, 60);
        char timeStr[16];
        if (format24Hour) {
            if (showSeconds) {
                strftime(timeStr, sizeof(timeStr), "%H:%M:%S", &timeinfo);
            } else {
                strftime(timeStr, sizeof(timeStr), "%H:%M", &timeinfo);
            }
        } else {
            if (showSeconds) {
                strftime(timeStr, sizeof(timeStr), "%I:%M:%S %p", &timeinfo);
            } else {
                strftime(timeStr, sizeof(timeStr), "%I:%M %p", &timeinfo);
            }
        }
        tft.println(timeStr);
    }

    void setFormat24Hour(bool enable) {
        format24Hour = enable;
    }

    void setShowSeconds(bool enable) {
        showSeconds = enable;
    }

    void handleCommand(String command) {
        if (command.indexOf("\"type\":\"COMPONENT_UPDATE\"") > 0) {
            if (command.indexOf("\"format24\":true") > 0) {
                setFormat24Hour(true);
            } else if (command.indexOf("\"format24\":false") > 0) {
                setFormat24Hour(false);
            }
            
            if (command.indexOf("\"showSeconds\":true") > 0) {
                setShowSeconds(true);
            } else if (command.indexOf("\"showSeconds\":false") > 0) {
                setShowSeconds(false);
            }
        }
    }
};

TimeDisplayComponent timeDisplay;

void setup() {
    Serial.begin(115200);
    
    WiFi.begin("YOUR_WIFI_SSID", "YOUR_WIFI_PASSWORD");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi Connected");
    
    timeDisplay.init();
}

void loop() {
    timeDisplay.loop();
    
    if (Serial.available()) {
        String command = Serial.readStringUntil('\n');
        timeDisplay.handleCommand(command);
    }
}
