async function testDashboardAPI() {
  const baseUrl = 'https://help.hlw.work';
  
  console.log('=== 测试大屏 API ===\n');

  try {
    console.log('1. 测试 KPI 接口...');
    const kpiRes = await fetch(`${baseUrl}/dashboard/kpi`);
    const kpiData = await kpiRes.json();
    console.log('KPI 数据:', JSON.stringify(kpiData, null, 2));
    console.log('');

    console.log('2. 测试组件排行接口...');
    const rankingRes = await fetch(`${baseUrl}/dashboard/ai-feature-ranking`);
    const rankingData = await rankingRes.json();
    console.log('组件排行:', JSON.stringify(rankingData, null, 2));
    console.log('');

    console.log('3. 测试实时事件接口...');
    const eventsRes = await fetch(`${baseUrl}/dashboard/events?limit=5`);
    const eventsData = await eventsRes.json();
    console.log('最近 5 条事件:', JSON.stringify(eventsData, null, 2));
    console.log('');

    console.log('✅ 所有接口测试完成！');
  } catch (error) {
    console.error('❌ 测试失败:', error.message);
  }
}

testDashboardAPI();
