/**
 * 示例轨迹数据
 * 用于演示和测试轨迹回放功能
 */

export const sampleTrajectories = [
  {
    id: 'trajectory1',
    name: '轨迹1 - 解放碑到朝天门',
    color: '#FF5722',
    data: [
      { time: '2025/01/17 15:00:01', coords: [106.500692, 29.615953] },
      { time: '2025/01/17 15:00:04', coords: [106.500802, 29.615946] },
      { time: '2025/01/17 15:00:05', coords: [106.501214, 29.615967] },
      { time: '2025/01/17 15:00:06', coords: [106.501642, 29.615994] },
      { time: '2025/01/17 15:00:09', coords: [106.502274, 29.61595] },
      { time: '2025/01/17 15:00:15', coords: [106.503181, 29.615858] },
      { time: '2025/01/17 15:00:20', coords: [106.504123, 29.615756] },
      { time: '2025/01/17 15:00:25', coords: [106.505234, 29.615634] },
      { time: '2025/01/17 15:00:30', coords: [106.506345, 29.615512] },
      { time: '2025/01/17 15:00:35', coords: [106.507456, 29.615390] }
    ]
  },
  {
    id: 'trajectory2',
    name: '轨迹2 - 观音桥到南坪',
    color: '#2196F3',
    data: [
      { time: '2025/01/17 15:00:01', coords: [106.500500, 29.616000] },
      { time: '2025/01/17 15:00:02', coords: [106.500600, 29.616100] },
      { time: '2025/01/17 15:00:05', coords: [106.501000, 29.616200] },
      { time: '2025/01/17 15:00:06', coords: [106.501400, 29.616300] },
      { time: '2025/01/17 15:00:07', coords: [106.502000, 29.616400] },
      { time: '2025/01/17 15:00:15', coords: [106.502900, 29.616500] },
      { time: '2025/01/17 15:00:18', coords: [106.503800, 29.616600] },
      { time: '2025/01/17 15:00:22', coords: [106.504700, 29.616700] },
      { time: '2025/01/17 15:00:26', coords: [106.505600, 29.616800] },
      { time: '2025/01/17 15:00:30', coords: [106.506500, 29.616900] }
    ]
  },
  {
    id: 'trajectory3',
    name: '轨迹3 - 沙坪坝到江北',
    color: '#4CAF50',
    data: [
      { time: '2025/01/17 15:00:01', coords: [106.499000, 29.617000] },
      { time: '2025/01/17 15:00:03', coords: [106.499500, 29.617100] },
      { time: '2025/01/17 15:00:06', coords: [106.500000, 29.617200] },
      { time: '2025/01/17 15:00:08', coords: [106.500500, 29.617300] },
      { time: '2025/01/17 15:00:12', coords: [106.501000, 29.617400] },
      { time: '2025/01/17 15:00:16', coords: [106.501500, 29.617500] },
      { time: '2025/01/17 15:00:20', coords: [106.502000, 29.617600] },
      { time: '2025/01/17 15:00:24', coords: [106.502500, 29.617700] },
      { time: '2025/01/17 15:00:28', coords: [106.503000, 29.617800] },
      { time: '2025/01/17 15:00:32', coords: [106.503500, 29.617900] }
    ]
  }
]

/**
 * 生成随机轨迹数据
 * @param {Object} options 配置选项
 * @returns {Object} 轨迹数据
 */
export function generateRandomTrajectory(options = {}) {
  const {
    id = 'trajectory_' + Date.now(),
    name = '随机轨迹',
    color = '#' + Math.floor(Math.random() * 16777215).toString(16),
    pointCount = 10,
    startTime = new Date(),
    timeInterval = 3000, // 3秒间隔
    centerLng = 106.501642,
    centerLat = 29.615994,
    radius = 0.01 // 大约1公里范围
  } = options
  
  const data = []
  
  for (let i = 0; i < pointCount; i++) {
    // 生成随机偏移
    const angle = Math.random() * 2 * Math.PI
    const distance = Math.random() * radius
    
    const lng = centerLng + distance * Math.cos(angle)
    const lat = centerLat + distance * Math.sin(angle)
    
    // 生成时间戳
    const time = new Date(startTime.getTime() + i * timeInterval)
    
    data.push({
      time: time.toISOString().replace('T', ' ').substring(0, 19),
      coords: [lng, lat]
    })
  }
  
  return {
    id,
    name,
    color,
    data
  }
}

export default sampleTrajectories
