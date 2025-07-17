/**
 * 高德地图API配置示例
 * 请复制此文件为 amap.js 并填入您的实际API密钥
 */

export const AMAP_CONFIG = {
  // 高德地图API密钥 - 请在高德开放平台申请
  // https://console.amap.com/dev/key/app
  apiKey: 'YOUR_AMAP_API_KEY',
  
  // API版本
  version: '2.0',
  
  // 需要加载的插件
  plugins: [
    // 'AMap.Scale',
    // 'AMap.ToolBar',
    // 'AMap.MoveAnimation'
  ],
  
  // 默认地图配置
  mapOptions: {
    center: [106.501642, 29.615994], // 重庆市中心
    zoom: 15,
    mapStyle: 'amap://styles/normal'
  }
}

export default AMAP_CONFIG
