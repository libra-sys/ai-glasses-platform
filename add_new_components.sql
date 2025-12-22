-- 添加定时提醒组件
INSERT INTO components (
  id, name, description, category, version, author_id, status, 
  image_url, file_url, download_count, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '定时提醒',
  '通过组件化开关机制实现自动提醒功能。安装组件后，服务器会根据配置的时间自动播报提醒内容，无需额外界面设置。支持每天多个提醒时间，24小时制配置。',
  'productivity',
  '1.0.0',
  (SELECT id FROM profiles WHERE email = 'admin@example.com' LIMIT 1),
  'approved',
  'https://help.hlw.work/images/components/reminder.png',
  'https://raw.githubusercontent.com/libra-sys/ai-glasses-platform/main/components/reminder/reminder.ino',
  0,
  NOW(),
  NOW()
);

-- 添加导航组件
INSERT INTO components (
  id, name, description, category, version, author_id, status, 
  image_url, file_url, download_count, created_at, updated_at
) VALUES (
  gen_random_uuid(),
  '智能导航',
  '基于手机定位的智能导航组件。由于ESP32眼镜没有GPS模块，本组件通过小程序上报手机定位，实现实时导航功能。支持步行导航、过马路检测、红绿灯识别等多种模式，关键路口自动语音播报。',
  'navigation',
  '1.0.0',
  (SELECT id FROM profiles WHERE email = 'admin@example.com' LIMIT 1),
  'approved',
  'https://help.hlw.work/images/components/navigation.png',
  'https://raw.githubusercontent.com/libra-sys/ai-glasses-platform/main/components/navigation/navigation.ino',
  0,
  NOW(),
  NOW()
);
