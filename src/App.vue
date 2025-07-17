<template>
  <div id="app">
    <header class="app-header">
      <h1>Vue轨迹回放播放器</h1>
      <p>基于高德地图和@amap/amap-jsapi-loader的轨迹回放组件</p>
    </header>
    
    <main class="app-main">
      <TrajectoryPlayer
        :amap-key="amapKey"
        :initial-trajectories="sampleTrajectories"
        :map-options="mapOptions"
        @ready="onPlayerReady"
        @error="onPlayerError"
        @time-update="onTimeUpdate"
        @play-state-change="onPlayStateChange"
        @trajectory-add="onTrajectoryAdd"
        @trajectory-select="onTrajectorySelect"
      />
    </main>
  </div>
</template>

<script>
import { ref, reactive, computed } from 'vue'
import TrajectoryPlayer from './components/TrajectoryPlayer.vue'

export default {
  name: 'App',
  components: {
    TrajectoryPlayer
  },
  setup() {
    // 高德地图API密钥 - 请替换为您的实际密钥
    const amapKey = ref(window.AMAP_CONFIG.apiKey) // 请替换为实际的API密钥
    
    // 地图配置
    const mapOptions = reactive({
      center: [106.501642, 29.615994], // 重庆市中心
      zoom: 15
    })
    
    // 播放器状态
    const playerReady = ref(false)
    const playerError = ref(null)
    const showStatus = ref(true)
    const trajectoryCount = ref(0)
    const selectedTrajectoryName = ref('无')
    
    // 播放状态
    const playState = reactive({
      isPlaying: false,
      isPaused: false
    })
    
    // 时间信息
    const timeInfo = reactive({
      currentTime: null,
      startTime: null,
      endTime: null,
      progress: 0
    })
    
    // 示例轨迹数据 - 修复结束时间不一致问题
    const sampleTrajectories = ref([
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
          { time: '2025/01/17 15:00:25', coords: [106.505234, 29.615634] }
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
          { time: '2025/01/17 15:00:29', coords: [106.505600, 29.616800] }
        ]
      }
    ])
    
    // 计算属性
    const playStateText = computed(() => {
      if (playState.isPlaying) return '播放中'
      if (playState.isPaused) return '已暂停'
      return '已停止'
    })
    
    const playStateClass = computed(() => ({
      'status-playing': playState.isPlaying,
      'status-paused': playState.isPaused,
      'status-stopped': !playState.isPlaying && !playState.isPaused
    }))
    
    const currentTimeText = computed(() => {
      if (!timeInfo.currentTime) return '--:--:--'
      return timeInfo.currentTime.toLocaleTimeString()
    })
    
    const progressText = computed(() => {
      return `${Math.round(timeInfo.progress * 100)}%`
    })
    
    // 事件处理
    const onPlayerReady = () => {
      playerReady.value = true
      playerError.value = null
      trajectoryCount.value = sampleTrajectories.value.length
      console.log('播放器初始化完成')
    }
    
    const onPlayerError = (error) => {
      playerError.value = error
      console.error('播放器错误:', error)
    }
    
    const onTimeUpdate = (info) => {
      Object.assign(timeInfo, info)
    }
    
    const onPlayStateChange = (state) => {
      Object.assign(playState, state)
    }
    
    const onTrajectoryAdd = (trajectory) => {
      trajectoryCount.value++
      console.log('添加轨迹:', trajectory)
    }
    
    const onTrajectorySelect = (trajectoryId) => {
      const trajectory = sampleTrajectories.value.find(t => t.id === trajectoryId)
      selectedTrajectoryName.value = trajectory ? trajectory.name : '未知轨迹'
    }
    
    // 控制方法
    const loadSampleData = () => {
      // 重新加载示例数据
      sampleTrajectories.value = [...sampleTrajectories.value]
      console.log('重新加载示例数据')
    }
    
    const clearAllTrajectories = () => {
      if (confirm('确定要清空所有轨迹吗？')) {
        sampleTrajectories.value = []
        trajectoryCount.value = 0
        selectedTrajectoryName.value = '无'
        console.log('清空所有轨迹')
      }
    }
    
    return {
      // 配置
      amapKey,
      mapOptions,
      sampleTrajectories,
      
      // 状态
      playerReady,
      playerError,
      showStatus,
      playState,
      timeInfo,
      trajectoryCount,
      selectedTrajectoryName, 
      
      // 计算属性
      playStateText,
      playStateClass,
      currentTimeText,
      progressText,
      
      // 事件处理
      onPlayerReady,
      onPlayerError,
      onTimeUpdate,
      onPlayStateChange,
      onTrajectoryAdd,
      onTrajectorySelect,
      
      // 控制方法
      loadSampleData,
      clearAllTrajectories
    }
  }
}
</script>

<style>
/* 全局样式重置 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
}

#app {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

/* 应用头部 */
.app-header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.app-header h1 {
  font-size: 24px;
  margin-bottom: 8px;
  font-weight: 600;
}

.app-header p {
  font-size: 14px;
  opacity: 0.9;
}

/* 主要内容区域 */
.app-main {
  flex: 1;
  position: relative;
}

/* 状态面板 */
.status-panel {
  position: absolute;
  top: 20px;
  right: 20px;
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  min-width: 200px;
}

.status-panel h3 {
  margin-bottom: 12px;
  color: #2c3e50;
  font-size: 16px;
  border-bottom: 1px solid #eee;
  padding-bottom: 8px;
}

.status-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
}

.status-item label {
  color: #666;
  font-weight: 500;
}

.status-item span {
  color: #2c3e50;
  font-weight: 600;
}

.status-playing {
  color: #27ae60 !important;
}

.status-paused {
  color: #f39c12 !important;
}

.status-stopped {
  color: #95a5a6 !important;
}

/* 应用控制按钮 */
.app-controls {
  position: absolute;
  bottom: 20px;
  right: 20px;
  display: flex;
  gap: 12px;
  z-index: 1000;
}

.control-btn {
  background: white;
  color: #2c3e50;
  border: 1px solid #ddd;
  padding: 10px 16px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background: #f8f9fa;
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.control-btn.danger {
  color: #e74c3c;
  border-color: #e74c3c;
}

.control-btn.danger:hover {
  background: #e74c3c;
  color: white;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .app-header {
    padding: 16px;
  }
  
  .app-header h1 {
    font-size: 20px;
  }
  
  .status-panel {
    position: relative;
    top: auto;
    right: auto;
    margin: 16px;
    width: calc(100% - 32px);
  }
  
  .app-controls {
    position: relative;
    bottom: auto;
    right: auto;
    margin: 16px;
    justify-content: center;
  }
  
  .control-btn {
    padding: 8px 12px;
    font-size: 12px;
  }
}
</style>
