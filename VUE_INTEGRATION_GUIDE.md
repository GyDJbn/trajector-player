# Vue项目集成指南

## 🚀 快速集成

### 1. 文件结构
```
your-vue-project/
├── src/
│   ├── components/
│   │   └── trajectory/
│   │       ├── TrajectoryPlayer.vue      # Vue组件
│   │       ├── useTrajectoryPlayer.js    # Composable Hook
│   │       └── ExampleUsage.vue          # 使用示例
│   ├── utils/
│   │   ├── trajectory-player.js          # 核心播放器类
│   │   ├── progress-control.js           # 进度控制类
│   │   └── config.js                     # 配置文件
│   └── assets/
│       └── trajectory-styles.css         # 样式文件
```

### 2. 安装依赖
```bash
# 如果使用Element Plus (可选)
npm install element-plus

# 如果使用其他UI库，请相应调整组件代码
```

### 3. 三种集成方式

## 方式一：直接使用Vue组件 (推荐)

### 特点
- ✅ 开箱即用，无需额外配置
- ✅ 完整的UI界面和交互
- ✅ 支持所有功能特性
- ✅ 适合快速原型和完整功能需求

### 使用方法
```vue
<template>
  <TrajectoryPlayer
    :initial-trajectories="trajectories"
    :map-options="mapConfig"
    :amap-key="amapKey"
    @time-update="handleTimeUpdate"
    @play-state-change="handlePlayStateChange"
  />
</template>

<script>
import TrajectoryPlayer from '@/components/trajectory/TrajectoryPlayer.vue'

export default {
  components: { TrajectoryPlayer },
  data() {
    return {
      amapKey: 'YOUR_AMAP_KEY',
      mapConfig: {
        center: [106.501642, 29.615994],
        zoom: 15
      },
      trajectories: [
        {
          id: 'traj1',
          name: '轨迹1',
          color: '#FF5722',
          data: [
            { time: '2025/07/14 14:59:33', coords: [106.500692, 29.615953] }
            // ... 更多数据点
          ]
        }
      ]
    }
  },
  methods: {
    handleTimeUpdate(timeInfo) {
      console.log('当前时间:', timeInfo.currentTime)
    },
    handlePlayStateChange(state) {
      console.log('播放状态:', state.isPlaying)
    }
  }
}
</script>
```

## 方式二：使用Composable Hook (灵活)

### 特点
- ✅ 高度灵活，可自定义UI
- ✅ 响应式状态管理
- ✅ 符合Vue 3 Composition API规范
- ✅ 适合自定义界面和复杂业务逻辑

### 使用方法
```vue
<template>
  <div class="custom-trajectory-player">
    <div ref="mapContainer" class="map"></div>
    
    <!-- 自定义控制界面 -->
    <div class="custom-controls">
      <button @click="play" :disabled="playState.isPlaying">播放</button>
      <button @click="pause" :disabled="!playState.isPlaying">暂停</button>
      <span>{{ formatTime(timeInfo.currentTime) }}</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useTrajectoryPlayer } from '@/components/trajectory/useTrajectoryPlayer.js'

export default {
  setup() {
    const mapContainer = ref(null)
    
    const {
      initPlayer,
      play,
      pause,
      addTrajectory,
      playState,
      timeInfo,
      formatTime
    } = useTrajectoryPlayer({
      amapKey: 'YOUR_AMAP_KEY',
      autoInit: false
    })
    
    onMounted(async () => {
      await initPlayer(mapContainer.value)
      
      // 添加轨迹数据
      addTrajectory({
        id: 'custom-trajectory',
        name: '自定义轨迹',
        color: '#2196F3',
        data: trajectoryData
      })
    })
    
    return {
      mapContainer,
      play,
      pause,
      playState,
      timeInfo,
      formatTime
    }
  }
}
</script>
```

## 方式三：集成到现有业务组件 (业务导向)

### 特点
- ✅ 与现有业务逻辑深度集成
- ✅ 可复用现有UI组件和样式
- ✅ 支持复杂的业务场景
- ✅ 适合已有项目的功能扩展

### 使用方法
```vue
<template>
  <div class="vehicle-monitoring">
    <!-- 现有的车辆列表 -->
    <VehicleList 
      :vehicles="vehicles" 
      @select="selectVehicle"
    />
    
    <!-- 集成轨迹播放器 -->
    <div ref="trajectoryMap" class="trajectory-map"></div>
    
    <!-- 现有的控制面板 -->
    <ControlPanel 
      :current-vehicle="selectedVehicle"
      :play-state="playState"
      @play="playTrajectory"
      @pause="pauseTrajectory"
    />
  </div>
</template>

<script>
import { useTrajectoryPlayer } from '@/components/trajectory/useTrajectoryPlayer.js'
import VehicleList from './VehicleList.vue'
import ControlPanel from './ControlPanel.vue'

export default {
  components: { VehicleList, ControlPanel },
  setup() {
    const trajectoryMap = ref(null)
    const selectedVehicle = ref(null)
    
    // 集成轨迹播放器
    const {
      initPlayer,
      play,
      pause,
      addTrajectory,
      clearAllTrajectories,
      playState
    } = useTrajectoryPlayer({
      amapKey: process.env.VUE_APP_AMAP_KEY,
      autoInit: false
    })
    
    const selectVehicle = async (vehicle) => {
      selectedVehicle.value = vehicle
      
      // 加载车辆轨迹
      const trajectoryData = await fetchVehicleTrajectory(vehicle.id)
      
      clearAllTrajectories()
      addTrajectory({
        id: `vehicle_${vehicle.id}`,
        name: `${vehicle.name}轨迹`,
        color: vehicle.color,
        data: trajectoryData
      })
    }
    
    const playTrajectory = () => play()
    const pauseTrajectory = () => pause()
    
    onMounted(() => {
      initPlayer(trajectoryMap.value)
    })
    
    return {
      trajectoryMap,
      selectedVehicle,
      playState,
      selectVehicle,
      playTrajectory,
      pauseTrajectory
    }
  }
}
</script>
```

## 🔧 配置和自定义

### 1. 环境变量配置
```javascript
// .env.local
VUE_APP_AMAP_KEY=your_amap_api_key

// 在组件中使用
const amapKey = process.env.VUE_APP_AMAP_KEY
```

### 2. 全局配置
```javascript
// main.js
import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)

// 全局配置轨迹播放器
app.config.globalProperties.$trajectoryConfig = {
  amapKey: process.env.VUE_APP_AMAP_KEY,
  defaultMapOptions: {
    center: [106.501642, 29.615994],
    zoom: 15
  }
}

app.mount('#app')
```

### 3. 样式自定义
```scss
// 使用CSS变量进行主题定制
:root {
  --trajectory-primary-color: #2196F3;
  --trajectory-success-color: #4CAF50;
  --trajectory-warning-color: #FF9800;
  --trajectory-error-color: #F44336;
}

// 覆盖默认样式
.trajectory-player-container {
  .control-panel {
    background: var(--trajectory-primary-color);
  }
  
  .progress-fill {
    background: linear-gradient(90deg, var(--trajectory-primary-color), var(--trajectory-success-color));
  }
}
```

## 📦 打包和部署

### 1. 构建优化
```javascript
// vue.config.js
module.exports = {
  configureWebpack: {
    externals: {
      // 高德地图API作为外部依赖
      'AMap': 'AMap'
    }
  },
  chainWebpack: config => {
    // 轨迹相关资源优化
    config.optimization.splitChunks({
      chunks: 'all',
      cacheGroups: {
        trajectory: {
          name: 'trajectory',
          test: /[\\/]trajectory[\\/]/,
          priority: 10
        }
      }
    })
  }
}
```

### 2. 懒加载
```javascript
// 路由懒加载
const TrajectoryView = () => import('@/views/TrajectoryView.vue')

// 组件懒加载
const TrajectoryPlayer = defineAsyncComponent(() =>
  import('@/components/trajectory/TrajectoryPlayer.vue')
)
```

## 🚨 注意事项

### 1. API密钥安全
- ✅ 使用环境变量存储API密钥
- ✅ 在生产环境中配置域名白名单
- ❌ 不要将API密钥硬编码在代码中

### 2. 性能优化
- ✅ 大量轨迹点时启用数据抽样
- ✅ 使用虚拟滚动处理大量轨迹列表
- ✅ 合理设置地图缩放级别和更新频率

### 3. 错误处理
```javascript
// 统一错误处理
const { addTrajectory } = useTrajectoryPlayer()

try {
  await addTrajectory(trajectoryData)
} catch (error) {
  console.error('添加轨迹失败:', error)
  // 显示用户友好的错误信息
  ElMessage.error('轨迹数据格式错误，请检查数据格式')
}
```

### 4. 类型支持 (TypeScript)
```typescript
// types/trajectory.ts
export interface TrajectoryPoint {
  time: string
  coords: [number, number]
}

export interface Trajectory {
  id: string
  name: string
  color: string
  data: TrajectoryPoint[]
}

// 在组件中使用
import type { Trajectory } from '@/types/trajectory'

const trajectories = ref<Trajectory[]>([])
```

## 🔄 升级和维护

### 版本更新
1. 定期更新高德地图API版本
2. 关注Vue版本兼容性
3. 更新依赖包到最新稳定版本

### 功能扩展
- 支持更多地图服务商 (百度、腾讯等)
- 添加轨迹分析功能 (速度、距离统计)
- 支持实时轨迹推送
- 添加轨迹导出功能

这个集成方案提供了最大的灵活性，你可以根据具体需求选择最适合的集成方式！
