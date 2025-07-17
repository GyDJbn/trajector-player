# Vue轨迹回放播放器

基于Vue 3和高德地图的轨迹回放组件，使用`@amap/amap-jsapi-loader`进行地图API加载管理。

## 🚀 特性

- ✅ **Vue 3 Composition API** - 现代化的Vue开发体验
- ✅ **包管理器集成** - 使用`@amap/amap-jsapi-loader`管理高德地图API
- ✅ **ES6模块化** - 完全模块化的代码结构
- ✅ **TypeScript友好** - 良好的类型支持
- ✅ **多轨迹支持** - 同时播放多条轨迹
- ✅ **播放控制** - 播放、暂停、重置、倍速播放
- ✅ **进度控制** - 可拖拽的进度条
- ✅ **响应式设计** - 适配移动端和桌面端
- ✅ **事件系统** - 完整的事件回调机制

## 📦 安装

### 1. 安装依赖

```bash
npm install vue@^3.4.0 @amap/amap-jsapi-loader@^1.0.1
```

### 2. 开发依赖（如果使用Vite）

```bash
npm install -D @vitejs/plugin-vue@^4.5.0 vite@^5.0.0
```

## 🔧 配置

### 1. 获取高德地图API密钥

1. 访问 [高德开放平台](https://console.amap.com/dev/key/app)
2. 注册并创建应用
3. 获取Web服务API密钥

### 2. 配置API密钥

创建配置文件 `src/config/amap.js`：

```javascript
export const AMAP_CONFIG = {
  apiKey: 'YOUR_AMAP_API_KEY', // 替换为您的实际密钥
  version: '2.0',
  plugins: [],
  mapOptions: {
    center: [106.501642, 29.615994],
    zoom: 15
  }
}
```

## 🎯 快速开始

### 基础用法

```vue
<template>
  <div style="height: 100vh;">
    <TrajectoryPlayer
      :amap-key="amapKey"
      :initial-trajectories="trajectories"
      @ready="onReady"
      @error="onError"
    />
  </div>
</template>

<script>
import { ref } from 'vue'
import TrajectoryPlayer from './components/TrajectoryPlayer.vue'

export default {
  components: { TrajectoryPlayer },
  setup() {
    const amapKey = ref('YOUR_AMAP_API_KEY')
    
    const trajectories = ref([
      {
        id: 'trajectory1',
        name: '示例轨迹',
        color: '#FF5722',
        data: [
          { time: '2025/01/17 15:00:01', coords: [106.500692, 29.615953] },
          { time: '2025/01/17 15:00:05', coords: [106.501642, 29.615994] },
          { time: '2025/01/17 15:00:10', coords: [106.502274, 29.61595] }
        ]
      }
    ])
    
    const onReady = () => {
      console.log('播放器准备就绪')
    }
    
    const onError = (error) => {
      console.error('播放器错误:', error)
    }
    
    return {
      amapKey,
      trajectories,
      onReady,
      onError
    }
  }
}
</script>
```

### 使用Composition API

```javascript
import { useTrajectoryPlayer } from './composables/useTrajectoryPlayer.js'

export default {
  setup() {
    const {
      mapContainer,
      isPlayerReady,
      loading,
      error,
      playState,
      timeInfo,
      progress,
      trajectoryList,
      initPlayer,
      addTrajectory,
      play,
      pause,
      reset
    } = useTrajectoryPlayer({
      key: 'YOUR_AMAP_API_KEY',
      mapOptions: {
        center: [106.501642, 29.615994],
        zoom: 15
      }
    })
    
    // 初始化播放器
    onMounted(async () => {
      await initPlayer()
    })
    
    return {
      mapContainer,
      isPlayerReady,
      loading,
      error,
      playState,
      timeInfo,
      progress,
      trajectoryList,
      addTrajectory,
      play,
      pause,
      reset
    }
  }
}
```

## 📚 API文档

### TrajectoryPlayer 组件

#### Props

| 属性名 | 类型 | 必填 | 默认值 | 说明 |
|--------|------|------|--------|------|
| `amapKey` | String | ✅ | - | 高德地图API密钥 |
| `initialTrajectories` | Array | ❌ | `[]` | 初始轨迹数据 |
| `mapOptions` | Object | ❌ | `{center: [106.501642, 29.615994], zoom: 15}` | 地图配置 |

#### Events

| 事件名 | 参数 | 说明 |
|--------|------|------|
| `ready` | - | 播放器初始化完成 |
| `error` | `error` | 播放器错误 |
| `time-update` | `{currentTime, startTime, endTime, progress}` | 时间更新 |
| `play-state-change` | `{isPlaying, isPaused}` | 播放状态变化 |
| `trajectory-add` | `trajectory` | 添加轨迹 |
| `trajectory-remove` | `trajectoryId` | 移除轨迹 |
| `trajectory-select` | `trajectoryId` | 选择轨迹 |

### useTrajectoryPlayer 组合式函数

#### 参数

```javascript
const options = {
  key: 'YOUR_AMAP_API_KEY',    // 高德地图API密钥
  version: '2.0',              // API版本
  plugins: [],                 // 需要加载的插件
  mapOptions: {                // 地图配置
    center: [106.501642, 29.615994],
    zoom: 15
  }
}
```

#### 返回值

```javascript
const {
  // 响应式引用
  mapContainer,        // 地图容器引用
  player,             // 播放器实例
  isMapLoaded,        // 地图是否加载完成
  isPlayerReady,      // 播放器是否准备就绪
  loading,            // 加载状态
  error,              // 错误信息
  
  // 响应式数据
  playState,          // 播放状态 {isPlaying, isPaused}
  timeInfo,           // 时间信息 {currentTime, startTime, endTime}
  progress,           // 播放进度 (0-1)
  selectedSpeed,      // 播放速度
  speedOptions,       // 速度选项
  trajectoryList,     // 轨迹列表
  
  // 方法
  initPlayer,         // 初始化播放器
  addTrajectory,      // 添加轨迹
  removeTrajectory,   // 移除轨迹
  toggleTrajectoryVisibility, // 切换轨迹可见性
  play,               // 播放
  pause,              // 暂停
  reset,              // 重置
  seekTo,             // 跳转到指定时间
  setPlaySpeed,       // 设置播放速度
  seekToProgress,     // 跳转到进度位置
  formatTime,         // 格式化时间
  formatActualDuration, // 格式化实际播放时长
  destroy             // 销毁播放器
} = useTrajectoryPlayer(options)
```

## 🎨 轨迹数据格式

```javascript
const trajectory = {
  id: 'unique_id',           // 唯一标识
  name: '轨迹名称',           // 显示名称
  color: '#FF5722',          // 轨迹颜色
  data: [                    // 轨迹点数据
    {
      time: '2025/01/17 15:00:01',  // 时间戳
      coords: [106.500692, 29.615953] // 经纬度坐标 [lng, lat]
    },
    // ... 更多轨迹点
  ]
}
```

## 🔄 项目结构

```
src/
├── components/
│   └── TrajectoryPlayer.vue     # 主要组件
├── composables/
│   └── useTrajectoryPlayer.js   # 组合式函数
├── lib/
│   └── TrajectoryPlayer.js      # 核心播放器类
├── config/
│   └── amap.example.js          # 配置示例
├── data/
│   └── sampleTrajectories.js    # 示例数据
├── App.vue                      # 应用入口
└── main.js                      # 主文件
```

## 🚀 运行项目

### 开发环境

```bash
# 安装依赖
npm install

# 配置API密钥
cp src/config/amap.example.js src/config/amap.js
# 编辑 src/config/amap.js 填入您的API密钥

# 启动开发服务器
npm run dev
```

### 生产构建

```bash
npm run build
```

## 🔧 自定义配置

### Vite配置

```javascript
// vite.config.js
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          vue: ['vue'],
          amap: ['@amap/amap-jsapi-loader']
        }
      }
    }
  }
})
```

## 🐛 常见问题

### 1. API密钥错误

**问题**: 地图加载失败，提示API密钥错误

**解决**: 
- 检查API密钥是否正确
- 确认密钥对应的服务已开启
- 检查域名白名单设置

### 2. 轨迹数据格式错误

**问题**: 轨迹无法正常显示

**解决**:
- 确认时间格式为 `YYYY/MM/DD HH:mm:ss`
- 确认坐标格式为 `[经度, 纬度]`
- 检查数据是否按时间排序

### 3. 组件初始化失败

**问题**: 组件无法正常初始化

**解决**:
- 确认容器元素已正确挂载
- 检查网络连接
- 查看控制台错误信息

## 📄 许可证

MIT License

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📞 支持

如有问题，请提交 Issue 或联系开发者。

## 🔗 相关链接

- [高德开放平台](https://lbs.amap.com/)
- [Vue 3 官方文档](https://vuejs.org/)
- [@amap/amap-jsapi-loader](https://www.npmjs.com/package/@amap/amap-jsapi-loader)
- [Vite 官方文档](https://vitejs.dev/)

## 📝 更新日志

### v1.0.0 (2025-01-17)

- ✅ 初始版本发布
- ✅ 支持Vue 3 Composition API
- ✅ 集成@amap/amap-jsapi-loader
- ✅ 完整的轨迹回放功能
- ✅ 响应式设计
- ✅ 完善的文档和示例

## 🎯 路线图

- [ ] TypeScript支持
- [ ] 单元测试
- [ ] 更多地图样式支持
- [ ] 轨迹编辑功能
- [ ] 数据导入导出
- [ ] 性能优化

## 🙏 致谢

感谢以下开源项目：

- [Vue.js](https://vuejs.org/) - 渐进式JavaScript框架
- [高德地图](https://lbs.amap.com/) - 提供地图服务
- [Vite](https://vitejs.dev/) - 下一代前端构建工具
