# Vue轨迹回放播放器集成指南

## 🚀 快速集成到现有Vue项目

### 1. 安装依赖

```bash
npm install @amap/amap-jsapi-loader
```

### 2. 复制核心文件

将以下文件复制到您的项目中：

```
src/
├── components/
│   └── TrajectoryPlayer.vue      # 主组件
├── composables/
│   └── useTrajectoryPlayer.js    # 组合式函数
└── lib/
    └── TrajectoryPlayer.js       # 核心类
```

### 3. 基础使用

```vue
<template>
  <div style="height: 500px;">
    <TrajectoryPlayer
      amap-key="YOUR_API_KEY"
      :initial-trajectories="trajectories"
    />
  </div>
</template>

<script>
import TrajectoryPlayer from '@/components/TrajectoryPlayer.vue'

export default {
  components: { TrajectoryPlayer },
  data() {
    return {
      trajectories: [
        {
          id: 'test1',
          name: '测试轨迹',
          color: '#FF5722',
          data: [
            { time: '2025/01/17 15:00:01', coords: [106.500692, 29.615953] },
            { time: '2025/01/17 15:00:05', coords: [106.501642, 29.615994] }
          ]
        }
      ]
    }
  }
}
</script>
```

## 🔧 与现有项目集成

### Element Plus项目

如果您的项目使用Element Plus，可以直接使用，组件已经兼容。

### Ant Design Vue项目

替换对话框部分为Ant Design组件：

```vue
<!-- 将 TrajectoryPlayer.vue 中的对话框部分替换为 -->
<a-modal
  v-model:visible="showAddDialog"
  title="添加轨迹数据"
  @ok="addTrajectory"
  @cancel="closeDialog"
>
  <a-form layout="vertical">
    <a-form-item label="轨迹名称">
      <a-input v-model:value="newTrajectory.name" />
    </a-form-item>
    <a-form-item label="轨迹颜色">
      <input type="color" v-model="newTrajectory.color" />
    </a-form-item>
    <a-form-item label="轨迹数据">
      <a-textarea 
        v-model:value="newTrajectory.dataText" 
        :rows="8"
      />
    </a-form-item>
  </a-form>
</a-modal>
```

### Vuetify项目

替换为Vuetify组件：

```vue
<v-dialog v-model="showAddDialog" max-width="500px">
  <v-card>
    <v-card-title>添加轨迹数据</v-card-title>
    <v-card-text>
      <v-text-field
        v-model="newTrajectory.name"
        label="轨迹名称"
      />
      <input type="color" v-model="newTrajectory.color" />
      <v-textarea
        v-model="newTrajectory.dataText"
        label="轨迹数据"
        rows="8"
      />
    </v-card-text>
    <v-card-actions>
      <v-btn @click="closeDialog">取消</v-btn>
      <v-btn @click="addTrajectory" color="primary">添加</v-btn>
    </v-card-actions>
  </v-card>
</v-dialog>
```

## 🎯 自定义配置

### 1. 移除不需要的功能

如果不需要添加轨迹功能，可以隐藏相关UI：

```vue
<TrajectoryPlayer
  amap-key="YOUR_API_KEY"
  :initial-trajectories="trajectories"
  :show-add-button="false"
/>
```

### 2. 自定义样式

```vue
<style>
/* 覆盖默认样式 */
.trajectory-player-container {
  border-radius: 8px;
  overflow: hidden;
}

.control-panel {
  background: #f5f5f5;
}

.control-btn {
  background: #your-brand-color;
}
</style>
```

### 3. 自定义事件处理

```vue
<TrajectoryPlayer
  @ready="onPlayerReady"
  @time-update="onTimeUpdate"
  @play-state-change="onPlayStateChange"
/>
```

```javascript
methods: {
  onPlayerReady() {
    console.log('播放器准备就绪')
    // 可以在这里执行初始化后的操作
  },
  
  onTimeUpdate(timeInfo) {
    // 同步时间信息到其他组件
    this.$emit('time-sync', timeInfo)
  },
  
  onPlayStateChange(state) {
    // 更新全局播放状态
    this.$store.commit('updatePlayState', state)
  }
}
```

## 🔐 API密钥管理

### 开发环境

```javascript
// .env.development
VITE_AMAP_API_KEY=your_development_key
```

```javascript
// 在组件中使用
const amapKey = import.meta.env.VITE_AMAP_API_KEY
```

### 生产环境

```javascript
// .env.production
VITE_AMAP_API_KEY=your_production_key
```

### 动态配置

```javascript
// 从后端API获取密钥
async mounted() {
  const response = await fetch('/api/config')
  const config = await response.json()
  this.amapKey = config.amapKey
}
```

## 📱 移动端适配

### 1. 响应式布局

组件已内置响应式设计，在移动端会自动调整布局。

### 2. 触摸事件优化

```javascript
// 在 useTrajectoryPlayer.js 中添加触摸支持
const startDragging = (e) => {
  const event = e.touches ? e.touches[0] : e
  // ... 处理触摸事件
}
```

### 3. 移动端专用样式

```css
@media (max-width: 768px) {
  .control-panel {
    padding: 12px;
  }
  
  .control-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
  
  .trajectory-panel {
    max-height: 120px;
  }
}
```

## 🔄 数据格式转换

### 从GPS数据转换

```javascript
function convertGPSData(gpsData) {
  return gpsData.map(point => ({
    time: new Date(point.timestamp).toISOString().replace('T', ' ').substring(0, 19),
    coords: [point.longitude, point.latitude]
  }))
}
```

### 从GeoJSON转换

```javascript
function convertGeoJSON(geojson) {
  const coordinates = geojson.geometry.coordinates
  const times = geojson.properties.times || []
  
  return coordinates.map((coord, index) => ({
    time: times[index] || new Date(Date.now() + index * 1000).toISOString().replace('T', ' ').substring(0, 19),
    coords: coord
  }))
}
```

## 🎨 主题定制

### 1. CSS变量

```css
:root {
  --trajectory-primary-color: #3498db;
  --trajectory-secondary-color: #2c3e50;
  --trajectory-success-color: #27ae60;
  --trajectory-danger-color: #e74c3c;
}
```

### 2. 深色主题

```css
[data-theme="dark"] {
  --trajectory-bg-color: #2c3e50;
  --trajectory-text-color: #ecf0f1;
  --trajectory-border-color: #34495e;
}
```

## 🚀 性能优化

### 1. 懒加载

```javascript
// 动态导入组件
const TrajectoryPlayer = defineAsyncComponent(() =>
  import('@/components/TrajectoryPlayer.vue')
)
```

### 2. 大数据量优化

```javascript
// 数据分页加载
const loadTrajectoryData = async (trajectoryId, page = 1, pageSize = 1000) => {
  const response = await fetch(`/api/trajectory/${trajectoryId}?page=${page}&size=${pageSize}`)
  return response.json()
}
```

### 3. 内存管理

```javascript
// 在组件销毁时清理资源
onUnmounted(() => {
  player.value?.destroy()
  // 清理其他资源
})
```

## 🔍 调试技巧

### 1. 开启调试模式

```javascript
const { player } = useTrajectoryPlayer({
  key: 'YOUR_API_KEY',
  debug: true // 开启调试模式
})
```

### 2. 控制台调试

```javascript
// 在浏览器控制台中访问播放器实例
window.trajectoryPlayer = player.value
```

### 3. 性能监控

```javascript
// 监控播放性能
const startTime = performance.now()
player.value.play()
const endTime = performance.now()
console.log(`播放启动耗时: ${endTime - startTime}ms`)
```

## ❓ 常见问题解决

### 1. 地图不显示

- 检查API密钥是否正确
- 确认网络连接正常
- 查看控制台错误信息

### 2. 轨迹播放异常

- 检查数据格式是否正确
- 确认时间戳顺序
- 验证坐标范围

### 3. 性能问题

- 减少轨迹点数量
- 使用数据分页
- 优化动画频率

## 📞 技术支持

如需更多帮助，请：

1. 查看完整文档：`README_VUE.md`
2. 提交Issue：描述问题和复现步骤
3. 参考示例代码：`src/App.vue`

---

**祝您集成顺利！** 🎉
