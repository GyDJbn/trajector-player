/**
 * 配置文件模板
 * 使用说明：
 * 1. 复制此文件为 config.js
 * 2. 将 YOUR_AMAP_API_KEY 替换为您的高德地图API密钥
 * 3. 如需要，可以添加其他配置项
 */

window.AMAP_CONFIG = {
    // 高德地图API密钥
    // 获取方式：https://console.amap.com/dev/key/app
    apiKey: 'YOUR_AMAP_API_KEY',
    
    // 地图默认配置
    map: {
        center: [106.501642, 29.615994], // 默认中心点 [经度, 纬度]
        zoom: 15, // 默认缩放级别
        mapStyle: 'amap://styles/normal' // 地图样式
    },
    
    // 轨迹播放配置
    player: {
        animationDuration: 1000, // 每段动画持续时间(ms)
        defaultSpeed: 1, // 默认播放速度
        timeStep: 100 // 时间步长(ms)
    }
};
