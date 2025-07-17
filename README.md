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
1. 复制 `api-config.example.js` 为 `api-config.js`
2. 将文件中的 `YOUR_AMAP_API_KEY` 替换为您的实际API密钥：

```javascript
window.AMAP_CONFIG = {
    apiKey: '您的高德地图API密钥'
};
```

**注意**：`api-config.js` 文件已添加到 `.gitignore` 中，不会被提交到代码库，确保您的API密钥安全。

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
├── config.js             # 系统配置文件
├── api-config.js         # API配置文件（需要自己创建）
├── api-config.example.js # API配置模板
├── README.md             # 项目说明
└── .gitignore           # Git忽略文件
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

1. **API密钥安全**：
   - `api-config.js` 文件包含敏感信息，已添加到 `.gitignore` 中
   - 请勿将包含真实API密钥的文件提交到公共代码库
   - 建议在生产环境中使用环境变量或其他安全方式管理API密钥

2. **API密钥配置**：请确保使用有效的高德地图API密钥

3. **数据格式**：确保轨迹数据中的坐标格式为 `[经度, 纬度]`

4. **时间格式**：支持标准的JavaScript Date构造函数可解析的时间格式

5. **性能优化**：大量轨迹点时建议进行数据抽样或分段加载

6. **浏览器兼容性**：建议使用现代浏览器（Chrome、Firefox、Safari、Edge）

## 许可证

MIT License

## 接入方式详细说明

本项目提供两种接入方式：**纯JavaScript方式**和**Vue组件方式**，可以根据您的项目需求选择合适的接入方式。

### 🚀 方式一：纯JavaScript接入（推荐用于传统Web项目）

#### 文件说明
- `index-html.html` - 纯JavaScript实现的完整示例
- `trajectory-player.js` - 核心轨迹播放器类
- `progress-control.js` - 进度条控制组件
- `main.js` - 主应用程序入口

#### 快速接入步骤

**1. 复制核心文件到您的项目**
```
your-project/
├── js/
│   ├── trajectory-player.js    # 核心播放器
│   ├── progress-control.js     # 进度条控制
│   └── config.js              # 配置文件
├── css/
│   └── trajectory-style.css   # 样式文件（从style.css复制）
└── index.html                 # 您的页面
```

**2. 在HTML中引入必要文件**
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <title>轨迹回放</title>
    <!-- 引入样式 -->
    <link rel="stylesheet" href="css/trajectory-style.css">

    <!-- 配置文件 -->
    <script src="js/config.js"></script>
    <script>
        // 配置您的高德地图API密钥
        window.AMAP_CONFIG = {
            apiKey: '您的高德地图API密钥'
        };
    </script>

    <!-- 动态加载高德地图API -->
    <script>
        (function() {
            const script = document.createElement('script');
            script.src = `https://webapi.amap.com/maps?v=2.0&key=${window.AMAP_CONFIG.apiKey}`;
            document.head.appendChild(script);
        })();
    </script>
</head>
<body>
    <!-- 地图容器 -->
    <div id="map-container"></div>

    <!-- 控制面板容器 -->
    <div class="control-panel">
        <!-- 进度条和控制按钮会自动生成 -->
    </div>

    <!-- 引入核心脚本 -->
    <script src="js/trajectory-player.js"></script>
    <script src="js/progress-control.js"></script>
    <script>
        // 初始化播放器
        document.addEventListener('DOMContentLoaded', function() {
            // 等待高德地图API加载完成
            const checkAMap = setInterval(() => {
                if (window.AMap) {
                    clearInterval(checkAMap);
                    initTrajectoryPlayer();
                }
            }, 100);
        });

        function initTrajectoryPlayer() {
            // 创建播放器实例
            const player = new TrajectoryPlayer('map-container', {
                center: [106.501642, 29.615994],
                zoom: 15,
                animationDuration: 1000
            });

            // 创建进度控制器
            const progressControl = new ProgressControl(player);

            // 添加轨迹数据
            const trajectory = {
                id: 'trajectory1',
                name: '示例轨迹',
                color: '#FF5722',
                data: [
                    {
                        time: '2025/07/14 14:59:33',
                        coords: [106.500692, 29.615953]
                    },
                    // ... 更多轨迹点
                ]
            };

            player.addTrajectory(trajectory);
        }
    </script>
</body>
</html>
```

**3. 自定义配置**
```javascript
// 在config.js中自定义配置
window.TRAJECTORY_CONFIG = {
    // 播放速度选项
    speedOptions: [0.5, 1, 2, 4],

    // 默认播放速度
    defaultSpeed: 1,

    // 动画持续时间(毫秒)
    animationDuration: 1000,

    // 进度条更新间隔(毫秒)
    progressUpdateInterval: 100,

    // 键盘快捷键配置
    keyboardShortcuts: {
        play: 'Space',      // 播放/暂停
        reset: 'KeyR',      // 重置
        speedUp: 'ArrowRight',   // 快进
        speedDown: 'ArrowLeft'   // 快退
    }
};
```

### 🎯 方式二：Vue组件接入（推荐用于Vue项目）

#### 文件说明
- `/src` 目录 - Vue组件实现
- `src/components/TrajectoryPlayer.vue` - Vue轨迹播放器组件
- `src/composables/useTrajectoryPlayer.js` - Vue组合式API
- `src/lib/TrajectoryPlayer.js` - 核心播放器类（Vue版本）

#### Vue项目接入步骤

**1. 安装依赖**
```bash
# 使用npm
npm install vue@^3.4.0 @amap/amap-jsapi-loader@^1.0.1 element-plus@^2.4.0

# 使用yarn
yarn add vue@^3.4.0 @amap/amap-jsapi-loader@^1.0.1 element-plus@^2.4.0

# 使用pnpm
pnpm add vue@^3.4.0 @amap/amap-jsapi-loader@^1.0.1 element-plus@^2.4.0
```

**2. 复制组件文件到您的Vue项目**
```
your-vue-project/
├── src/
│   ├── components/
│   │   └── TrajectoryPlayer/
│   │       ├── TrajectoryPlayer.vue      # 主组件
│   │       └── index.js                  # 导出文件
│   ├── composables/
│   │   └── useTrajectoryPlayer.js        # 组合式API
│   ├── lib/
│   │   └── TrajectoryPlayer.js           # 核心类
│   └── config/
│       └── amap.js                       # 高德地图配置
```

**3. 配置高德地图API密钥**
```javascript
// src/config/amap.js
export const AMAP_CONFIG = {
    apiKey: '您的高德地图API密钥',
    version: '2.0',
    plugins: ['AMap.MoveAnimation']
};
```

**4. 在Vue组件中使用**
```vue
<template>
  <div class="app">
    <TrajectoryPlayer
      :amap-key="amapKey"
      :initial-trajectories="trajectories"
      :map-options="mapOptions"
      @ready="onPlayerReady"
      @error="onPlayerError"
      @time-update="onTimeUpdate"
      @play-state-change="onPlayStateChange"
    />
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import TrajectoryPlayer from '@/components/TrajectoryPlayer/TrajectoryPlayer.vue'

// 高德地图API密钥
const amapKey = '您的高德地图API密钥'

// 地图配置
const mapOptions = reactive({
  center: [106.501642, 29.615994],
  zoom: 15,
  animationDuration: 1000
})

// 轨迹数据
const trajectories = ref([
  {
    id: 'trajectory1',
    name: '示例轨迹',
    color: '#FF5722',
    data: [
      {
        time: '2025/07/14 14:59:33',
        coords: [106.500692, 29.615953]
      },
      // ... 更多轨迹点
    ]
  }
])

// 事件处理
const onPlayerReady = (player) => {
  console.log('播放器已准备就绪', player)
}

const onPlayerError = (error) => {
  console.error('播放器错误:', error)
}

const onTimeUpdate = (timeInfo) => {
  console.log('时间更新:', timeInfo)
}

const onPlayStateChange = (stateInfo) => {
  console.log('播放状态变化:', stateInfo)
}
</script>
```

**5. 全局注册组件（可选）**
```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'
import TrajectoryPlayer from '@/components/TrajectoryPlayer'

const app = createApp(App)

// 全局注册组件
app.component('TrajectoryPlayer', TrajectoryPlayer)

app.mount('#app')
```

**6. 使用组合式API（高级用法）**
```vue
<script setup>
import { useTrajectoryPlayer } from '@/composables/useTrajectoryPlayer'

const {
  player,
  isReady,
  isPlaying,
  currentTime,
  progress,
  trajectories,
  addTrajectory,
  removeTrajectory,
  play,
  pause,
  reset,
  seekTo,
  setPlaySpeed
} = useTrajectoryPlayer({
  amapKey: '您的API密钥',
  mapOptions: {
    center: [106.501642, 29.615994],
    zoom: 15
  }
})

// 添加轨迹
const handleAddTrajectory = () => {
  addTrajectory({
    id: 'new_trajectory',
    name: '新轨迹',
    color: '#4CAF50',
    data: [/* 轨迹数据 */]
  })
}

// 播放控制
const handlePlay = () => play()
const handlePause = () => pause()
const handleReset = () => reset()
</script>
```

### 📦 组件API参考

#### TrajectoryPlayer组件Props
```typescript
interface Props {
  amapKey: string                    // 高德地图API密钥
  initialTrajectories?: Trajectory[] // 初始轨迹数据
  mapOptions?: MapOptions           // 地图配置选项
  playerOptions?: PlayerOptions     // 播放器配置选项
}

interface MapOptions {
  center?: [number, number]         // 地图中心点 [经度, 纬度]
  zoom?: number                     // 缩放级别
  animationDuration?: number        // 动画持续时间(ms)
}

interface PlayerOptions {
  speedOptions?: number[]           // 播放速度选项
  defaultSpeed?: number            // 默认播放速度
  progressUpdateInterval?: number   // 进度更新间隔(ms)
  enableKeyboardShortcuts?: boolean // 是否启用键盘快捷键
}
```

#### 组件事件
```typescript
interface Events {
  ready: (player: TrajectoryPlayer) => void      // 播放器准备就绪
  error: (error: Error) => void                  // 错误事件
  timeUpdate: (timeInfo: TimeInfo) => void       // 时间更新
  playStateChange: (stateInfo: StateInfo) => void // 播放状态变化
  trajectoryAdd: (trajectory: Trajectory) => void // 轨迹添加
  trajectoryRemove: (trajectoryId: string) => void // 轨迹移除
  trajectorySelect: (trajectoryId: string) => void // 轨迹选择
}
```

### 🔧 高级配置和自定义

#### 自定义样式
```css
/* 自定义播放器样式 */
.trajectory-player-container {
  /* 容器样式 */
}

.map-container {
  height: 600px; /* 自定义地图高度 */
}

.control-panel {
  /* 自定义控制面板样式 */
}

.progress-bar {
  /* 自定义进度条样式 */
}
```

#### 扩展功能示例
```javascript
// 添加轨迹统计功能
class ExtendedTrajectoryPlayer extends TrajectoryPlayer {
  getTrajectoryStats(trajectoryId) {
    const trajectory = this.trajectories.get(trajectoryId)
    if (!trajectory) return null

    return {
      totalPoints: trajectory.data.length,
      duration: this.calculateDuration(trajectory.data),
      distance: this.calculateDistance(trajectory.data),
      averageSpeed: this.calculateAverageSpeed(trajectory.data)
    }
  }

  calculateDistance(points) {
    // 计算轨迹总距离
    let totalDistance = 0
    for (let i = 1; i < points.length; i++) {
      totalDistance += AMap.GeometryUtil.distance(
        points[i-1].coords,
        points[i].coords
      )
    }
    return totalDistance
  }
}
```

### 🚨 常见问题和解决方案

#### 1. API密钥相关问题
```javascript
// 问题：API密钥无效
// 解决：检查密钥配置和域名白名单

// 开发环境配置
const AMAP_CONFIG = {
    apiKey: 'your-dev-api-key',
    // 开发环境可以使用localhost
}

// 生产环境配置
const AMAP_CONFIG = {
    apiKey: 'your-prod-api-key',
    // 生产环境需要配置正确的域名
}
```

#### 2. 轨迹数据格式问题
```javascript
// 错误的数据格式
const wrongFormat = {
    time: 1642147173000,  // 时间戳格式
    condit: [106.5, 29.6] // 错误的字段名
}

// 正确的数据格式
const correctFormat = {
    time: '2025/07/14 14:59:33', // 字符串格式
    coords: [106.5, 29.6]        // 正确的字段名
}
```

#### 3. Vue项目中的异步加载问题
```javascript
// 使用异步组件
import { defineAsyncComponent } from 'vue'

const TrajectoryPlayer = defineAsyncComponent(() =>
  import('@/components/TrajectoryPlayer/TrajectoryPlayer.vue')
)
```

#### 4. 性能优化建议
```javascript
// 大数据量轨迹优化
const optimizeTrajectory = (trajectory, maxPoints = 1000) => {
  if (trajectory.data.length <= maxPoints) {
    return trajectory
  }

  // 数据抽样
  const step = Math.ceil(trajectory.data.length / maxPoints)
  const optimizedData = trajectory.data.filter((_, index) => index % step === 0)

  return {
    ...trajectory,
    data: optimizedData
  }
}
```

### 📚 更多示例

#### 从API加载轨迹数据
```javascript
// JavaScript版本
async function loadTrajectoryFromAPI(apiUrl) {
  try {
    const response = await fetch(apiUrl)
    const data = await response.json()

    const trajectory = {
      id: `api_${Date.now()}`,
      name: '来自API的轨迹',
      color: '#2196F3',
      data: data.map(point => ({
        time: point.timestamp,
        coords: [point.longitude, point.latitude]
      }))
    }

    player.addTrajectory(trajectory)
  } catch (error) {
    console.error('加载轨迹失败:', error)
  }
}

// Vue版本
const loadTrajectoryFromAPI = async (apiUrl) => {
  try {
    const response = await fetch(apiUrl)
    const data = await response.json()

    await addTrajectory({
      id: `api_${Date.now()}`,
      name: '来自API的轨迹',
      color: '#2196F3',
      data: data.map(point => ({
        time: point.timestamp,
        coords: [point.longitude, point.latitude]
      }))
    })
  } catch (error) {
    console.error('加载轨迹失败:', error)
  }
}
```

#### 批量处理轨迹
```javascript
// 批量添加多个轨迹
const batchAddTrajectories = (trajectoryList) => {
  trajectoryList.forEach((trajectory, index) => {
    setTimeout(() => {
      player.addTrajectory({
        ...trajectory,
        color: getRandomColor() // 随机颜色
      })
    }, index * 100) // 延迟添加，避免性能问题
  })
}

// 随机颜色生成
const getRandomColor = () => {
  const colors = ['#FF5722', '#4CAF50', '#2196F3', '#FF9800', '#9C27B0']
  return colors[Math.floor(Math.random() * colors.length)]
}
```

## 🔧 TrajectoryPlayer 核心实现原理详解

### 📋 整体架构设计

TrajectoryPlayer采用**面向对象设计**，核心思想是将轨迹回放功能封装成一个独立的类，通过**状态管理**、**时间插值**和**事件驱动**的方式实现平滑的轨迹动画效果。

#### 核心架构图
```
┌─────────────────────────────────────────────────────────────┐
│                    TrajectoryPlayer                         │
├─────────────────────────────────────────────────────────────┤
│  数据层 (Data Layer)                                        │
│  ├── trajectories: Map<id, TrajectoryInfo>                 │
│  ├── markers: Map<id, AMap.Marker>                         │
│  ├── polylines: Map<id, AMap.Polyline>                     │
│  └── animations: Map<id, Animation>                        │
├─────────────────────────────────────────────────────────────┤
│  状态层 (State Layer)                                       │
│  ├── 播放状态: isPlaying, isPaused                         │
│  ├── 时间状态: currentTime, startTime, endTime             │
│  └── 播放控制: playSpeed, progress                         │
├─────────────────────────────────────────────────────────────┤
│  控制层 (Control Layer)                                     │
│  ├── 播放控制: play(), pause(), reset()                    │
│  ├── 时间控制: seekTo(), setPlaySpeed()                    │
│  └── 轨迹管理: addTrajectory(), removeTrajectory()         │
├─────────────────────────────────────────────────────────────┤
│  渲染层 (Render Layer)                                      │
│  ├── 地图渲染: AMap.Map                                     │
│  ├── 轨迹线渲染: AMap.Polyline                             │
│  └── 标记点渲染: AMap.Marker                               │
└─────────────────────────────────────────────────────────────┘
```

### 🏗️ 核心数据结构

#### 1. 轨迹数据结构
```javascript
// 原始轨迹数据
const trajectory = {
    id: 'trajectory1',           // 唯一标识
    name: '轨迹名称',            // 显示名称
    color: '#FF5722',           // 轨迹颜色
    data: [                     // 轨迹点数组
        {
            time: '2025/07/14 14:59:33',    // 时间戳
            coords: [106.500692, 29.615953] // 经纬度坐标
        }
    ]
};

// 内部处理后的轨迹信息
const trajectoryInfo = {
    id: 'trajectory1',
    name: '轨迹名称',
    color: '#FF5722',
    data: [                     // 预处理后的数据
        {
            time: Date对象,      // 转换为Date对象
            coords: [lng, lat],  // 原始坐标
            lnglat: AMap.LngLat  // 高德地图坐标对象
        }
    ],
    visible: true,              // 可见性状态
    marker: AMap.Marker,        // 移动标记点
    polyline: AMap.Polyline,    // 轨迹线
    currentIndex: 0             // 当前播放位置索引
};
```

#### 2. 状态管理结构
```javascript
class TrajectoryPlayer {
    constructor() {
        // 数据存储 - 使用Map提供O(1)查找性能
        this.trajectories = new Map();  // 轨迹数据
        this.markers = new Map();       // 标记点映射
        this.polylines = new Map();     // 轨迹线映射
        this.animations = new Map();    // 动画对象映射

        // 播放状态
        this.isPlaying = false;         // 是否正在播放
        this.isPaused = false;          // 是否暂停
        this.playSpeed = 1;             // 播放速度倍数

        // 时间状态
        this.currentTime = null;        // 当前播放时间
        this.startTime = null;          // 开始时间
        this.endTime = null;            // 结束时间

        // 回调函数
        this.callbacks = {
            onTimeUpdate: null,         // 时间更新回调
            onPlayStateChange: null,    // 播放状态变化回调
            onProgressChange: null      // 进度变化回调
        };
    }
}
```

### ⚙️ 核心算法实现

#### 1. 时间插值算法 (Time Interpolation)

**核心思想**：在两个轨迹点之间进行线性插值，实现平滑的位置过渡。

<augment_code_snippet path="src/lib/TrajectoryPlayer.js" mode="EXCERPT">
````javascript
updateTrajectoryPosition(trajectory) {
    const data = trajectory.data;

    // 找到当前时间对应的位置
    for (let i = 0; i < data.length - 1; i++) {
        if (this.currentTime >= data[i].time && this.currentTime <= data[i + 1].time) {
            // 计算插值位置
            const current = data[i];
            const next = data[i + 1];
            const progress = (this.currentTime - current.time) / (next.time - current.time);

            const lng = current.coords[0] + (next.coords[0] - current.coords[0]) * progress;
            const lat = current.coords[1] + (next.coords[1] - current.coords[1]) * progress;

            trajectory.marker.setPosition(new this.AMap.LngLat(lng, lat));
            break;
        }
    }
}
````
</augment_code_snippet>

**算法详解**：
1. **时间区间查找**：遍历轨迹点，找到当前时间所在的时间区间 `[t_i, t_{i+1}]`
2. **进度计算**：`progress = (currentTime - t_i) / (t_{i+1} - t_i)`
3. **坐标插值**：
   - `lng = lng_i + (lng_{i+1} - lng_i) × progress`
   - `lat = lat_i + (lat_{i+1} - lat_i) × progress`
4. **位置更新**：将插值后的坐标设置给标记点

#### 2. 多轨迹同步播放算法

**核心思想**：统一时间轴管理，所有轨迹共享同一个时间状态。

<augment_code_snippet path="src/lib/TrajectoryPlayer.js" mode="EXCERPT">
````javascript
updateTimeRange() {
    let minTime = null;
    let maxTime = null;

    this.trajectories.forEach(trajectory => {
        if (trajectory.data.length > 0) {
            const firstTime = trajectory.data[0].time;
            const lastTime = trajectory.data[trajectory.data.length - 1].time;

            if (!minTime || firstTime < minTime) minTime = firstTime;
            if (!maxTime || lastTime > maxTime) maxTime = lastTime;
        }
    });

    this.startTime = minTime;
    this.endTime = maxTime;
    this.currentTime = minTime;
}
````
</augment_code_snippet>

**算法流程**：
1. **时间范围计算**：遍历所有轨迹，找到最早开始时间和最晚结束时间
2. **统一时间轴**：所有轨迹使用相同的 `currentTime` 进行位置计算
3. **异步处理**：不同轨迹可能在不同时间开始/结束，通过时间判断控制显示/隐藏

#### 3. 播放速度控制算法

**核心思想**：通过调整时间步长实现变速播放，而不是改变动画频率。

<augment_code_snippet path="src/lib/TrajectoryPlayer.js" mode="EXCERPT">
````javascript
startAnimation() {
    const animate = () => {
        if (!this.isPlaying) return;

        // 时间步长 = 基础步长 × 播放速度
        const timeStep = 100 * this.playSpeed;
        const nextTime = new Date(this.currentTime.getTime() + timeStep);

        if (nextTime.getTime() >= this.endTime.getTime()) {
            // 播放结束
            this.currentTime = this.endTime;
            this.isPlaying = false;
            return;
        }

        this.currentTime = nextTime;
        this.updateAllTrajectoriesPosition();

        // 固定100ms间隔，保证进度条更新频率一致
        setTimeout(animate, 100);
    };

    animate();
}
````
</augment_code_snippet>

**速度控制原理**：
- **0.5倍速**：`timeStep = 100 × 0.5 = 50ms`，时间推进慢，播放慢
- **1倍速**：`timeStep = 100 × 1 = 100ms`，正常播放
- **2倍速**：`timeStep = 100 × 2 = 200ms`，时间推进快，播放快
- **动画频率固定**：始终保持100ms间隔调用，确保UI更新流畅

### 🎯 关键技术实现

#### 1. 数据预处理优化

<augment_code_snippet path="src/lib/TrajectoryPlayer.js" mode="EXCERPT">
````javascript
preprocessTrajectoryData(data) {
    return data.map(point => ({
        time: new Date(point.time),                                    // 字符串转Date对象
        coords: point.coords,                                          // 保留原始坐标
        lnglat: new this.AMap.LngLat(point.coords[0], point.coords[1]) // 预创建地图坐标对象
    })).sort((a, b) => a.time - b.time);                              // 按时间排序
}
````
</augment_code_snippet>

**优化策略**：
1. **时间对象预转换**：避免播放时重复转换字符串为Date对象
2. **坐标对象预创建**：减少播放时的对象创建开销
3. **数据排序**：确保轨迹点按时间顺序排列
4. **数据验证**：在预处理阶段发现和处理数据问题

#### 2. 内存管理和性能优化

```javascript
// 使用Map数据结构提供O(1)查找性能
this.trajectories = new Map();  // 而不是数组查找O(n)

// 对象池模式 - 复用坐标对象
const coordinatePool = [];
const getCoordinate = (lng, lat) => {
    const coord = coordinatePool.pop() || new AMap.LngLat(0, 0);
    coord.setLng(lng);
    coord.setLat(lat);
    return coord;
};

// 销毁时清理资源
destroy() {
    this.pause();
    this.trajectories.forEach(trajectory => {
        this.map.remove([trajectory.marker, trajectory.polyline]);
    });
    this.trajectories.clear();
    this.markers.clear();
    this.polylines.clear();
}
```

#### 3. 事件驱动架构

<augment_code_snippet path="src/lib/TrajectoryPlayer.js" mode="EXCERPT">
````javascript
// 回调函数设计
setCallbacks(callbacks) {
    this.callbacks = { ...this.callbacks, ...callbacks };
}

// 事件通知机制
notifyTimeUpdate() {
    if (this.callbacks.onTimeUpdate) {
        this.callbacks.onTimeUpdate({
            currentTime: this.currentTime,
            startTime: this.startTime,
            endTime: this.endTime,
            progress: this.getProgress()
        });
    }
}
````
</augment_code_snippet>

**事件系统优势**：
1. **解耦设计**：播放器核心逻辑与UI控制分离
2. **可扩展性**：易于添加新的事件监听器
3. **状态同步**：确保UI与播放器状态实时同步

### 🔄 Vue组合式API封装

#### useTrajectoryPlayer组合函数设计

<augment_code_snippet path="src/composables/useTrajectoryPlayer.js" mode="EXCERPT">
````javascript
export function useTrajectoryPlayer(options = {}) {
    // 响应式状态管理
    const player = ref(null)
    const playState = reactive({
        isPlaying: false,
        isPaused: false
    })

    const timeInfo = reactive({
        startTime: null,
        currentTime: null,
        endTime: null
    })

    // 异步初始化
    const initPlayer = async () => {
        const AMap = await loadAMapAPI()
        const map = new AMap.Map(mapContainer.value, options.mapOptions)
        player.value = new TrajectoryPlayer(AMap, map)

        // 绑定回调
        player.value.setCallbacks({
            onTimeUpdate: handleTimeUpdate,
            onPlayStateChange: handlePlayStateChange
        })
    }

    return {
        // 响应式数据
        player, playState, timeInfo,
        // 控制方法
        play, pause, reset, seekTo,
        // 轨迹管理
        addTrajectory, removeTrajectory
    }
}
````
</augment_code_snippet>

**Vue集成优势**：
1. **响应式状态**：自动触发UI更新
2. **生命周期管理**：自动处理组件销毁时的资源清理
3. **异步处理**：优雅处理地图API加载
4. **类型安全**：TypeScript支持

### 🎮 交互控制实现

#### 进度条拖拽控制

```javascript
// 进度条点击跳转
const handleProgressClick = (e) => {
    const rect = progressBar.value.getBoundingClientRect()
    const clickX = e.clientX - rect.left
    const newProgress = clickX / rect.width
    seekToProgress(newProgress)
}

// 拖拽控制
const startDragging = (e) => {
    isDragging.value = true

    const handleMouseMove = (e) => {
        const rect = progressBar.value.getBoundingClientRect()
        const dragX = e.clientX - rect.left
        const newProgress = Math.max(0, Math.min(1, dragX / rect.width))
        seekToProgress(newProgress)
    }

    const handleMouseUp = () => {
        isDragging.value = false
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)
}
```

#### 键盘快捷键支持

```javascript
// 键盘事件处理
document.addEventListener('keydown', (e) => {
    switch(e.code) {
        case 'Space':
            e.preventDefault()
            playState.isPlaying ? pause() : play()
            break
        case 'KeyR':
            reset()
            break
        case 'ArrowLeft':
            seekToProgress(Math.max(0, progress.value - 0.05))
            break
        case 'ArrowRight':
            seekToProgress(Math.min(1, progress.value + 0.05))
            break
    }
})
```

### 🚀 性能优化策略

#### 1. 大数据量优化
```javascript
// 数据抽样算法
const optimizeTrajectory = (trajectory, maxPoints = 1000) => {
    if (trajectory.data.length <= maxPoints) return trajectory

    const step = Math.ceil(trajectory.data.length / maxPoints)
    const optimizedData = trajectory.data.filter((_, index) => index % step === 0)

    return { ...trajectory, data: optimizedData }
}

// 分段加载
const loadTrajectoryInChunks = async (trajectory, chunkSize = 100) => {
    const chunks = []
    for (let i = 0; i < trajectory.data.length; i += chunkSize) {
        chunks.push(trajectory.data.slice(i, i + chunkSize))
    }

    for (const chunk of chunks) {
        await new Promise(resolve => {
            setTimeout(() => {
                addTrajectoryChunk(chunk)
                resolve()
            }, 10)
        })
    }
}
```

#### 2. 渲染优化
```javascript
// 视口裁剪 - 只渲染可见区域的轨迹点
const isPointInViewport = (point, bounds) => {
    return bounds.contains(point.lnglat)
}

// 层级管理 - 根据缩放级别调整显示密度
const getDisplayDensity = (zoom) => {
    if (zoom < 10) return 0.1      // 显示10%的点
    if (zoom < 15) return 0.5      // 显示50%的点
    return 1.0                     // 显示所有点
}
```

#### 3. 内存泄漏防护
```javascript
// 定时器清理
const timers = new Set()
const safeSetTimeout = (callback, delay) => {
    const timer = setTimeout(() => {
        timers.delete(timer)
        callback()
    }, delay)
    timers.add(timer)
    return timer
}

// 组件销毁时清理
onUnmounted(() => {
    timers.forEach(timer => clearTimeout(timer))
    timers.clear()
    player.value?.destroy()
})
```

### 🔍 调试和监控

#### 性能监控
```javascript
// 播放性能监控
const performanceMonitor = {
    frameCount: 0,
    startTime: Date.now(),

    tick() {
        this.frameCount++
        const elapsed = Date.now() - this.startTime
        if (elapsed >= 1000) {
            console.log(`FPS: ${this.frameCount}`)
            this.frameCount = 0
            this.startTime = Date.now()
        }
    }
}

// 内存使用监控
const memoryMonitor = () => {
    if (performance.memory) {
        console.log({
            used: Math.round(performance.memory.usedJSHeapSize / 1048576) + 'MB',
            total: Math.round(performance.memory.totalJSHeapSize / 1048576) + 'MB'
        })
    }
}
```

### 📊 架构优势总结

1. **模块化设计**：核心播放器、Vue组合函数、UI组件分离
2. **高性能**：时间插值算法、Map数据结构、对象池模式
3. **可扩展性**：事件驱动架构、插件化设计
4. **易用性**：Vue响应式集成、声明式API
5. **健壮性**：错误处理、资源管理、内存泄漏防护

这种架构设计使得TrajectoryPlayer既能处理简单的单轨迹回放，也能应对复杂的多轨迹、大数据量场景，同时保持良好的性能和用户体验。

## 更新日志

### v1.0.0
- 初始版本发布
- 支持基础轨迹回放功能
- 进度条控制和时间显示
- 多轨迹同时播放
- 键盘快捷键支持
- 提供JavaScript和Vue两种接入方式
