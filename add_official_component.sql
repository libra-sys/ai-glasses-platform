-- 添加官方推荐组件示例

-- 1. 时间显示组件
INSERT INTO components (
  name,
  description,
  category,
  version,
  status,
  author_id,
  download_count,
  image_url,
  file_url,
  created_at
) VALUES (
  '时间显示',
  '在眼镜屏幕上显示当前时间，支持多种时间格式，包括12/24小时制，可自定义更新频率和显示样式',
  'productivity',
  '1.0.0',
  'approved',
  (SELECT id FROM auth.users WHERE email = 'user1@aiglasses.local'),
  0,
  'https://via.placeholder.com/512x512/4A90E2/ffffff?text=时钟',
  'https://example.com/components/time-display.zip',
  NOW()
);

-- 2. 心率监测组件
INSERT INTO components (
  name,
  description,
  category,
  version,
  status,
  author_id,
  download_count,
  image_url,
  file_url,
  created_at
) VALUES (
  '心率监测',
  '实时监测并显示心率数据，支持异常心率提醒，记录历史数据，帮助用户关注健康状况',
  'health',
  '1.0.0',
  'approved',
  (SELECT id FROM auth.users WHERE email = 'user1@aiglasses.local'),
  0,
  'https://via.placeholder.com/512x512/E74C3C/ffffff?text=心率',
  'https://example.com/components/heart-rate.zip',
  NOW()
);

-- 3. AR导航组件
INSERT INTO components (
  name,
  description,
  category,
  version,
  status,
  author_id,
  download_count,
  image_url,
  file_url,
  created_at
) VALUES (
  'AR导航助手',
  '实时AR导航，箭头直接显示在视野中，支持步行、驾驶模式，智能避障，准确到达目的地',
  'navigation',
  '1.0.0',
  'approved',
  (SELECT id FROM auth.users WHERE email = 'user1@aiglasses.local'),
  0,
  'https://via.placeholder.com/512x512/2ECC71/ffffff?text=导航',
  'https://example.com/components/ar-navigation.zip',
  NOW()
);

-- 4. 实时翻译组件
INSERT INTO components (
  name,
  description,
  category,
  version,
  status,
  author_id,
  download_count,
  image_url,
  file_url,
  created_at
) VALUES (
  '实时翻译',
  '支持中英日韩等多语言即时翻译，语音识别准确率高达98%，让跨语言交流无障碍',
  'translation',
  '1.0.0',
  'approved',
  (SELECT id FROM auth.users WHERE email = 'user1@aiglasses.local'),
  0,
  'https://via.placeholder.com/512x512/9B59B6/ffffff?text=翻译',
  'https://example.com/components/translator.zip',
  NOW()
);

-- 5. 消息通知组件
INSERT INTO components (
  name,
  description,
  category,
  version,
  status,
  author_id,
  download_count,
  image_url,
  file_url,
  created_at
) VALUES (
  '消息通知',
  '同步手机通知到眼镜，支持微信、QQ、短信等，重要消息不错过，可自定义提醒方式',
  'productivity',
  '1.0.0',
  'approved',
  (SELECT id FROM auth.users WHERE email = 'user1@aiglasses.local'),
  0,
  'https://via.placeholder.com/512x512/F39C12/ffffff?text=消息',
  'https://example.com/components/notifications.zip',
  NOW()
);
