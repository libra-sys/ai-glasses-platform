#include <Arduino.h>
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>
#include <TFT_eSPI.h>

TFT_eSPI tft = TFT_eSPI();

class RealtimeTranslator {
private:
    const char* apiKey = "sk-2ca3ccbc4c7944748f46bae80a33fa5b";
    const char* apiUrl = "https://dashscope.aliyuncs.com/api/v1/services/aigc/text-generation/generation";
    String sourceLang = "zh";
    String targetLang = "en";
    String inputBuffer = "";
    String translatedText = "";
    bool isTranslating = false;

public:
    void init() {
        tft.init();
        tft.setRotation(1);
        tft.fillScreen(TFT_BLACK);
        tft.setTextColor(TFT_WHITE, TFT_BLACK);
        
        displayStatus("翻译组件已就绪");
        Serial.println("实时翻译组件已初始化");
    }

    void loop() {
        if (Serial.available()) {
            String command = Serial.readStringUntil('\n');
            handleCommand(command);
        }
    }

    void handleCommand(String command) {
        if (command.indexOf("\"type\":\"TRANSLATE\"") > 0) {
            int textStart = command.indexOf("\"text\":\"") + 8;
            int textEnd = command.indexOf("\"", textStart);
            String text = command.substring(textStart, textEnd);
            
            translate(text);
        } else if (command.indexOf("\"type\":\"SET_LANG\"") > 0) {
            if (command.indexOf("\"source\":\"") > 0) {
                int start = command.indexOf("\"source\":\"") + 10;
                int end = command.indexOf("\"", start);
                sourceLang = command.substring(start, end);
            }
            if (command.indexOf("\"target\":\"") > 0) {
                int start = command.indexOf("\"target\":\"") + 10;
                int end = command.indexOf("\"", start);
                targetLang = command.substring(start, end);
            }
            displayStatus("语言已设置");
        }
    }

    void translate(String text) {
        if (WiFi.status() != WL_CONNECTED) {
            displayStatus("WiFi未连接");
            return;
        }

        isTranslating = true;
        displayStatus("翻译中...");

        HTTPClient http;
        http.begin(apiUrl);
        http.addHeader("Content-Type", "application/json");
        http.addHeader("Authorization", String("Bearer ") + apiKey);

        String sourceLangName = getLanguageName(sourceLang);
        String targetLangName = getLanguageName(targetLang);
        
        String jsonPayload = "{\"model\":\"qwen-turbo\",\"input\":{\"messages\":[{\"role\":\"system\",\"content\":\"你是专业翻译助手。将用户输入从" + sourceLangName + "翻译成" + targetLangName + "，只返回翻译结果。\"},{\"role\":\"user\",\"content\":\"" + text + "\"}]},\"parameters\":{\"result_format\":\"text\"}}";

        int httpCode = http.POST(jsonPayload);

        if (httpCode == HTTP_CODE_OK) {
            String response = http.getString();
            parseTranslation(response);
            displayTranslation(text);
        } else {
            displayStatus("翻译失败");
            Serial.println("HTTP Error: " + String(httpCode));
        }

        http.end();
        isTranslating = false;
    }

    void parseTranslation(String response) {
        StaticJsonDocument<2048> doc;
        DeserializationError error = deserializeJson(doc, response);
        
        if (!error) {
            const char* text = doc["output"]["text"];
            if (text) {
                translatedText = String(text);
            } else {
                const char* content = doc["output"]["choices"][0]["message"]["content"];
                if (content) {
                    translatedText = String(content);
                }
            }
        }
    }

    void displayStatus(String status) {
        tft.fillRect(0, 0, tft.width(), 30, TFT_BLACK);
        tft.setTextSize(1);
        tft.setCursor(10, 10);
        tft.println(status);
    }

    void displayTranslation(String original) {
        tft.fillScreen(TFT_BLACK);
        
        tft.setTextSize(1);
        tft.setCursor(10, 10);
        tft.setTextColor(TFT_GREEN, TFT_BLACK);
        tft.println("原文:");
        
        tft.setCursor(10, 30);
        tft.setTextColor(TFT_WHITE, TFT_BLACK);
        tft.println(original);
        
        tft.setCursor(10, 60);
        tft.setTextColor(TFT_CYAN, TFT_BLACK);
        tft.println("译文:");
        
        tft.setCursor(10, 80);
        tft.setTextColor(TFT_WHITE, TFT_BLACK);
        tft.println(translatedText);
    }

    String getLanguageName(String code) {
        if (code == "zh") return "中文";
        if (code == "en") return "英语";
        if (code == "ja") return "日语";
        if (code == "ko") return "韩语";
        if (code == "es") return "西班牙语";
        if (code == "fr") return "法语";
        if (code == "de") return "德语";
        if (code == "ru") return "俄语";
        return code;
    }
};

RealtimeTranslator translator;

void setup() {
    Serial.begin(115200);
    
    WiFi.begin("YOUR_WIFI_SSID", "YOUR_WIFI_PASSWORD");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWiFi已连接");
    
    translator.init();
}

void loop() {
    translator.loop();
}
