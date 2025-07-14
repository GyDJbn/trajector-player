# 高德地图轨迹回放系统

一个基于高德地图JavaScript API的轨迹回放系统，支持多轨迹同时播放、进度条控制和时间显示。

## 功能特性

### 核心功能
- ✅ 轨迹数据回放动画
- ✅ 进度条拖拽控制
- ✅ 实时时间显示（开始时间、当前时间、结束时间）
- ✅ 播放/暂停/重置控制
- ✅ 多倍速播放（0.5x, 1x, 2x, 4x）
- ✅ 多轨迹同时回放
- ✅ 轨迹显示/隐藏切换
- ✅ 键盘快捷键支持

### 交互功能
- 🎮 空格键：播放/暂停
- 🎮 R键：重置播放
- 🎮 左右箭头：快进/快退5秒
- 🎮 数字键1-4：切换播放速度
- 🖱️ 进度条点击/拖拽：跳转到指定时间
- 🖱️ 轨迹列表：切换显示状态

## 快速开始

### 1. 获取高德地图API密钥
1. 访问 [高德开放平台](https://lbs.amap.com/)
2. 注册账号并创建应用
3. 获取Web服务API密钥

### 2. 配置API密钥
在 `index.html` 中替换 `YOUR_API_KEY`：
```html
<script src="https://webapi.amap.com/maps?v=2.0&key=YOUR_ACTUAL_API_KEY"></script>
```

### 3. 启动应用
直接在浏览器中打开 `index.html` 文件即可。

## 数据格式

### 轨迹数据格式
```javascript
const trajectory = {
    id: 'trajectory1',           // 轨迹唯一标识
    name: '轨迹名称',            // 显示名称
    color: '#FF5722',           // 轨迹颜色
    data: [                     // 轨迹点数据
        {
            time: '2025/07/14 14:59:33',    // 时间戳
            coords: [106.500692, 29.615953] // 经纬度坐标 [经度, 纬度]
        },
        // ... 更多轨迹点
    ]
};
```

### 后台接口数据格式
系统支持以下格式的后台数据：
```javascript
[
    {
        time: '2025/07/14 14:59:33',
        coords: [106.500692, 29.615953]  // 注意：原格式中的 condit 应为 coords
    },
    {
        time: '2025/07/14 15:00:34',
        coords: [106.500802, 29.615946]
    }
    // ... 更多数据点
]
```

## API 使用说明

### TrajectoryPlayer 类

#### 初始化
```javascript
const player = new TrajectoryPlayer('map-container', {
    center: [106.501642, 29.615994],  // 地图中心点
    zoom: 15,                         // 缩放级别
    animationDuration: 1000           // 动画持续时间(ms)
});
```

#### 主要方法
```javascript
// 添加轨迹
player.addTrajectory(trajectory);

// 播放控制
player.play();          // 开始播放
player.pause();         // 暂停播放
player.reset();         // 重置到开始
player.seekTo(time);    // 跳转到指定时间
player.setPlaySpeed(2); // 设置播放速度

// 轨迹管理
player.toggleTrajectoryVisibility(id, visible); // 切换轨迹显示
player.removeTrajectory(id);                     // 移除轨迹

// 设置回调
player.setCallbacks({
    onTimeUpdate: (timeInfo) => { /* 时间更新回调 */ },
    onPlayStateChange: (stateInfo) => { /* 播放状态变化回调 */ }
});
```

### ProgressControl 类

#### 初始化
```javascript
const progressControl = new ProgressControl(player);
```

#### 功能
- 自动同步播放器状态
- 处理进度条交互
- 更新时间显示
- 处理键盘快捷键

## 项目结构

```
├── index.html              # 主页面
├── style.css              # 样式文件
├── trajectory-player.js   # 轨迹播放器核心类
├── progress-control.js    # 进度条控制组件
├── main.js               # 主应用程序
└── README.md             # 说明文档
```

## 自定义和扩展

### 添加新的轨迹数据源
```javascript
// 从API获取数据
async function loadTrajectoryFromAPI(url) {
    const response = await fetch(url);
    const data = await response.json();
    
    const trajectory = {
        id: 'api_trajectory_' + Date.now(),
        name: '来自API的轨迹',
        color: '#4CAF50',
        data: data.map(point => ({
            time: point.time,
            coords: point.coords  // 确保字段名正确
        }))
    };
    
    player.addTrajectory(trajectory);
}
```

### 自定义标记样式
```javascript
// 在 TrajectoryPlayer 类中修改 createMarkerIcon 方法
createMarkerIcon(color) {
    return new AMap.Icon({
        size: new AMap.Size(32, 32),
        image: 'path/to/custom-marker.png'  // 使用自定义图标
    });
}
```

### 添加轨迹统计信息
```javascript
// 扩展轨迹信息显示
function showTrajectoryStats(trajectory) {
    const stats = {
        totalPoints: trajectory.data.length,
        duration: trajectory.data[trajectory.data.length - 1].time - trajectory.data[0].time,
        distance: calculateDistance(trajectory.data)
    };
    
    console.log('轨迹统计:', stats);
}
```

## 注意事项

1. **API密钥**：请确保使用有效的高德地图API密钥
2. **数据格式**：确保轨迹数据中的坐标格式为 `[经度, 纬度]`
3. **时间格式**：支持标准的JavaScript Date构造函数可解析的时间格式
4. **性能优化**：大量轨迹点时建议进行数据抽样或分段加载
5. **浏览器兼容性**：建议使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 许可证

MIT License

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础轨迹回放功能
- 进度条控制和时间显示
- 多轨迹同时播放
- 键盘快捷键支持
