<template>
  <div class="trajectory-example">
    <h1>轨迹回放系统 - Vue示例</h1>
    
    <!-- 方式1: 使用组件 -->
    <div class="example-section">
      <h2>方式1: 使用封装好的组件</h2>
      <TrajectoryPlayer
        :initial-trajectories="sampleTrajectories"
        :map-options="mapOptions"
        :amap-key="amapKey"
        @time-update="handleTimeUpdate"
        @play-state-change="handlePlayStateChange"
        @trajectory-add="handleTrajectoryAdd"
        @trajectory-select="handleTrajectorySelect"
      />
    </div>
    
    <!-- 方式2: 使用Composable Hook -->
    <div class="example-section">
      <h2>方式2: 使用Composable Hook</h2>
      <div class="hook-example">
        <div ref="mapContainer2" class="map-container"></div>
        
        <div class="controls">
          <div class="status-info">
            <p>播放状态: {{ playState.isPlaying ? '播放中' : '已暂停' }}</p>
            <p>当前时间: {{ formatTime(timeInfo.currentTime) }}</p>
            <p>播放进度: {{ Math.round(timeInfo.progress * 100) }}%</p>
            <p>轨迹数量: {{ trajectories.length }}</p>
          </div>
          
          <div class="control-buttons">
            <button @click="play" :disabled="playState.isPlaying">播放</button>
            <button @click="pause" :disabled="!playState.isPlaying">暂停</button>
            <button @click="reset">重置</button>
            <button @click="addSampleTrajectory">添加轨迹</button>
            <button @click="clearAllTrajectories">清空轨迹</button>
          </div>
          
          <div class="speed-control">
            <label>播放速度:</label>
            <select v-model="currentSpeed" @change="setPlaySpeed(currentSpeed)">
              <option v-for="speed in [0.5, 1, 2, 4]" :key="speed" :value="speed">
                {{ speed }}x
              </option>
            </select>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 方式3: 在现有项目中集成 -->
    <div class="example-section">
      <h2>方式3: 集成到现有业务组件</h2>
      <BusinessComponent />
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted } from 'vue'
import TrajectoryPlayer from './TrajectoryPlayer.vue'
import { useTrajectoryPlayer, useTrajectoryValidator } from './useTrajectoryPlayer.js'

// 业务组件示例
const BusinessComponent = {
  template: `
    <div class="business-component">
      <h3>业务场景: 车辆轨迹监控</h3>
      <div class="vehicle-list">
        <div 
          v-for="vehicle in vehicles" 
          :key="vehicle.id"
          class="vehicle-item"
          :class="{ active: selectedVehicle?.id === vehicle.id }"
          @click="selectVehicle(vehicle)"
        >
          <span class="vehicle-name">{{ vehicle.name }}</span>
          <span class="vehicle-status" :class="vehicle.status">{{ vehicle.status }}</span>
        </div>
      </div>
      
      <div ref="businessMapContainer" class="business-map"></div>
      
      <div class="business-controls">
        <button @click="loadVehicleTrajectory" :disabled="!selectedVehicle">
          加载轨迹
        </button>
        <button @click="startRealTimeTracking" :disabled="!selectedVehicle">
          实时跟踪
        </button>
      </div>
    </div>
  `,
  setup() {
    const businessMapContainer = ref(null)
    const selectedVehicle = ref(null)
    
    const vehicles = ref([
      { id: 'v1', name: '车辆001', status: 'online' },
      { id: 'v2', name: '车辆002', status: 'offline' },
      { id: 'v3', name: '车辆003', status: 'online' }
    ])
    
    // 使用轨迹播放器Hook
    const {
      initPlayer,
      addTrajectory,
      play,
      clearAllTrajectories,
      timeInfo,
      playState
    } = useTrajectoryPlayer({
      amapKey: 'YOUR_AMAP_KEY',
      autoInit: false
    })
    
    const selectVehicle = (vehicle) => {
      selectedVehicle.value = vehicle
    }
    
    const loadVehicleTrajectory = async () => {
      if (!selectedVehicle.value) return
      
      try {
        // 模拟从API获取轨迹数据
        const trajectoryData = await fetchVehicleTrajectory(selectedVehicle.value.id)
        
        clearAllTrajectories()
        addTrajectory({
          id: `trajectory_${selectedVehicle.value.id}`,
          name: `${selectedVehicle.value.name}轨迹`,
          color: '#FF5722',
          data: trajectoryData
        })
        
        play()
      } catch (error) {
        console.error('加载轨迹失败:', error)
      }
    }
    
    const startRealTimeTracking = () => {
      // 实时跟踪逻辑
      console.log('开始实时跟踪:', selectedVehicle.value)
    }
    
    const fetchVehicleTrajectory = async (vehicleId) => {
      // 模拟API调用
      return new Promise(resolve => {
        setTimeout(() => {
          resolve([
            { time: '2025/07/14 14:59:33', coords: [106.500692, 29.615953] },
            { time: '2025/07/14 15:00:34', coords: [106.500802, 29.615946] },
            { time: '2025/07/14 15:01:35', coords: [106.501214, 29.615967] }
          ])
        }, 1000)
      })
    }
    
    onMounted(() => {
      initPlayer(businessMapContainer.value)
    })
    
    return {
      businessMapContainer,
      vehicles,
      selectedVehicle,
      selectVehicle,
      loadVehicleTrajectory,
      startRealTimeTracking,
      timeInfo,
      playState
    }
  }
}

export default {
  name: 'TrajectoryExample',
  components: {
    TrajectoryPlayer,
    BusinessComponent
  },
  setup() {
    const mapContainer2 = ref(null)
    const currentSpeed = ref(1)
    
    // 配置
    const amapKey = 'YOUR_AMAP_KEY'
    const mapOptions = {
      center: [106.501642, 29.615994],
      zoom: 15
    }
    
    // 示例数据
    const sampleTrajectories = ref([
      {
        id: 'sample1',
        name: '示例轨迹1',
        color: '#FF5722',
        data: [
          { time: '2025/07/14 14:59:33', coords: [106.500692, 29.615953] },
          { time: '2025/07/14 15:00:34', coords: [106.500802, 29.615946] },
          { time: '2025/07/14 15:01:35', coords: [106.501214, 29.615967] }
        ]
      }
    ])
    
    // 使用Hook方式
    const {
      initPlayer,
      play,
      pause,
      reset,
      setPlaySpeed,
      addTrajectory,
      clearAllTrajectories,
      playState,
      timeInfo,
      trajectories,
      formatTime
    } = useTrajectoryPlayer({
      amapKey,
      mapOptions,
      autoInit: false
    })
    
    // 事件处理
    const handleTimeUpdate = (info) => {
      console.log('时间更新:', info)
    }
    
    const handlePlayStateChange = (state) => {
      console.log('播放状态变化:', state)
    }
    
    const handleTrajectoryAdd = (trajectory) => {
      console.log('轨迹添加:', trajectory)
    }
    
    const handleTrajectorySelect = (trajectoryId) => {
      console.log('轨迹选中:', trajectoryId)
    }
    
    const addSampleTrajectory = () => {
      const newTrajectory = {
        id: 'sample_' + Date.now(),
        name: '新轨迹',
        color: '#2196F3',
        data: [
          { time: '2025/07/14 16:00:00', coords: [106.500000, 29.616000] },
          { time: '2025/07/14 16:01:00', coords: [106.501000, 29.616100] },
          { time: '2025/07/14 16:02:00', coords: [106.502000, 29.616200] }
        ]
      }
      addTrajectory(newTrajectory)
    }
    
    onMounted(() => {
      // 初始化Hook方式的播放器
      initPlayer(mapContainer2.value)
    })
    
    return {
      // refs
      mapContainer2,
      
      // data
      amapKey,
      mapOptions,
      sampleTrajectories,
      currentSpeed,
      
      // hook返回值
      play,
      pause,
      reset,
      setPlaySpeed,
      addSampleTrajectory,
      clearAllTrajectories,
      playState,
      timeInfo,
      trajectories,
      formatTime,
      
      // event handlers
      handleTimeUpdate,
      handlePlayStateChange,
      handleTrajectoryAdd,
      handleTrajectorySelect
    }
  }
}
</script>

<style scoped>
.trajectory-example {
  padding: 20px;
}

.example-section {
  margin-bottom: 40px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
}

.hook-example {
  display: flex;
  gap: 20px;
}

.map-container {
  width: 60%;
  height: 400px;
  background: #f0f0f0;
}

.controls {
  width: 40%;
}

.status-info {
  background: #f8f9fa;
  padding: 15px;
  border-radius: 4px;
  margin-bottom: 15px;
}

.status-info p {
  margin: 5px 0;
}

.control-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-bottom: 15px;
}

.control-buttons button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #2196F3;
  color: white;
  cursor: pointer;
}

.control-buttons button:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.speed-control {
  display: flex;
  align-items: center;
  gap: 10px;
}

.business-component {
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 15px;
}

.vehicle-list {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.vehicle-item {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.vehicle-item.active {
  border-color: #2196F3;
  background: #f0f8ff;
}

.vehicle-status.online {
  color: #4CAF50;
}

.vehicle-status.offline {
  color: #f44336;
}

.business-map {
  width: 100%;
  height: 300px;
  background: #f0f0f0;
  margin-bottom: 15px;
}

.business-controls {
  display: flex;
  gap: 10px;
}

.business-controls button {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: #4CAF50;
  color: white;
  cursor: pointer;
}

.business-controls button:disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
