<template>
  <div class="trajectory-player-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p>正在加载高德地图...</p>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="error" class="error-overlay">
      <div class="error-message">
        <h3>加载失败</h3>
        <p>{{ error }}</p>
        <button @click="retry" class="retry-btn">重试</button>
      </div>
    </div>
    
    <!-- 地图容器 -->
    <div 
      ref="mapContainer" 
      class="map-container"
      :class="{ 'map-loading': loading || error }"
    ></div>
    
    <!-- 控制面板 -->
    <div v-if="isPlayerReady" class="control-panel">
      <!-- 时间显示 -->
      <div class="time-display">
        <span class="start-time">{{ formatTime(timeInfo.startTime) }}</span>
        <span class="current-time">{{ formatTime(timeInfo.currentTime) }}</span>
        <span class="end-time">{{ formatActualDuration(timeInfo.startTime, timeInfo.endTime) }}</span>
      </div>
      
      <!-- 进度条 -->
      <div class="progress-container">
        <div 
          ref="progressBar" 
          class="progress-bar" 
          @click="handleProgressClick"
        >
          <div 
            class="progress-fill" 
            :style="{ width: `${progress * 100}%` }"
          ></div>
          <div 
            ref="progressHandle"
            class="progress-handle" 
            :style="{ left: `${progress * 100}%` }"
            @mousedown="startDragging"
          ></div>
        </div>
      </div>
      
      <!-- 播放控制 -->
      <div class="control-buttons">
        <button 
          @click="play" 
          :disabled="playState.isPlaying"
          class="control-btn"
        >
          {{ playState.isPlaying ? '播放中...' : (playState.isPaused ? '继续' : '播放') }}
        </button>
        <button 
          @click="pause" 
          :disabled="!playState.isPlaying"
          class="control-btn"
        >
          暂停
        </button>
        <button @click="reset" class="control-btn">重置</button>
        <select v-model="selectedSpeed" @change="changeSpeed" class="speed-select">
          <option v-for="speed in speedOptions" :key="speed" :value="speed">
            {{ speed }}x
          </option>
        </select>
      </div>
    </div>
    
    <!-- 轨迹列表 -->
    <div v-if="isPlayerReady" class="trajectory-panel">
      <h3>轨迹列表</h3>
      <div class="trajectory-list">
        <div 
          v-for="trajectory in trajectoryList" 
          :key="trajectory.id"
          class="trajectory-item"
          :class="{ active: trajectory.visible, selected: trajectory.id === selectedTrajectoryId }"
          @click="selectTrajectory(trajectory.id)"
        >
          <div 
            class="trajectory-color" 
            :style="{ backgroundColor: trajectory.color }"
          ></div>
          <span class="trajectory-name">{{ trajectory.name }}</span>
          <div 
            class="trajectory-toggle"
            :class="{ active: trajectory.visible }"
            @click.stop="toggleTrajectory(trajectory.id)"
          ></div>
        </div>
      </div>
      <button @click="showAddDialog = true" class="add-btn">添加轨迹</button>
    </div>
    
    <!-- 添加轨迹对话框 -->
    <div v-if="showAddDialog" class="dialog-overlay" @click="closeDialog">
      <div class="dialog" @click.stop>
        <h3>添加轨迹数据</h3>
        <div class="form-group">
          <label>轨迹名称:</label>
          <input 
            v-model="newTrajectory.name" 
            type="text" 
            placeholder="请输入轨迹名称"
            class="form-input"
          >
        </div>
        <div class="form-group">
          <label>轨迹颜色:</label>
          <input 
            v-model="newTrajectory.color" 
            type="color" 
            class="form-input color-input"
          >
        </div>
        <div class="form-group">
          <label>轨迹数据:</label>
          <textarea 
            v-model="newTrajectory.dataText" 
            rows="8"
            placeholder="请输入JSON格式的轨迹数据"
            class="form-textarea"
          ></textarea>
        </div>
        <div class="dialog-buttons">
          <button @click="closeDialog" class="btn">取消</button>
          <button @click="addTrajectory" class="btn primary">添加</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, nextTick } from 'vue'
import { useTrajectoryPlayer } from '../composables/useTrajectoryPlayer.js'

export default {
  name: 'TrajectoryPlayer',
  props: {
    // 高德地图API密钥
    amapKey: {
      type: String,
      required: true
    },
    // 初始轨迹数据
    initialTrajectories: {
      type: Array,
      default: () => []
    },
    // 地图配置
    mapOptions: {
      type: Object,
      default: () => ({
        center: [106.501642, 29.615994],
        zoom: 15
      })
    },
  },
  emits: [
    'ready',
    'error',
    'time-update',
    'play-state-change', 
    'trajectory-add',
    'trajectory-remove',
    'trajectory-select'
  ],
  setup(props, { emit }) {
    // 使用轨迹播放器组合式函数
    const {
      mapContainer,
      isPlayerReady,
      loading,
      error,
      playState,
      timeInfo,
      progress,
      selectedSpeed,
      speedOptions,
      trajectoryList,
      initPlayer,
      addTrajectory: addTrajectoryToPlayer,
      removeTrajectory,
      toggleTrajectoryVisibility,
      play,
      pause,
      reset,
      setPlaySpeed,
      seekToProgress,
      formatTime,
      formatActualDuration
    } = useTrajectoryPlayer({
      key: props.amapKey,
      mapOptions: {
        ...props.mapOptions,
      }
    })
    
    // 本地状态
    const progressBar = ref(null)
    const progressHandle = ref(null)
    const showAddDialog = ref(false)
    const selectedTrajectoryId = ref(null)
    const isDragging = ref(false)
    
    const newTrajectory = reactive({
      name: '',
      color: '#FF5722',
      dataText: ''
    })
    
    // 初始化播放器
    const initialize = async () => {
      try {
        await initPlayer()
        
        // 加载初始轨迹
        props.initialTrajectories.forEach(trajectory => {
          addTrajectoryToPlayer(trajectory)
        })
        
        emit('ready')
      } catch (err) {
        emit('error', err)
      }
    }
    
    // 重试加载
    const retry = () => {
      initialize()
    }
    
    // 播放速度变化
    const changeSpeed = () => {
      setPlaySpeed(selectedSpeed.value)
    }
    
    // 进度条控制
    const handleProgressClick = (e) => {
      if (isDragging.value) return
      
      const rect = progressBar.value.getBoundingClientRect()
      const clickX = e.clientX - rect.left
      const newProgress = clickX / rect.width
      seekToProgress(newProgress)
    }
    
    const startDragging = (e) => {
      isDragging.value = true
      
      const handleMouseMove = (e) => {
        if (!isDragging.value) return
        
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
    
    // 轨迹管理
    const toggleTrajectory = (trajectoryId) => {
      const trajectory = trajectoryList.value.find(t => t.id === trajectoryId)
      if (trajectory) {
        trajectory.visible = !trajectory.visible
        toggleTrajectoryVisibility(trajectoryId, trajectory.visible)
      }
    }
    
    const selectTrajectory = (trajectoryId) => {
      selectedTrajectoryId.value = trajectoryId
      emit('trajectory-select', trajectoryId)
    }
    
    const addTrajectory = () => {
      try {
        const data = JSON.parse(newTrajectory.dataText)
        const trajectory = {
          id: 'trajectory_' + Date.now(),
          name: newTrajectory.name,
          color: newTrajectory.color,
          data: data
        }
        
        addTrajectoryToPlayer(trajectory)
        emit('trajectory-add', trajectory)
        
        closeDialog()
      } catch (error) {
        alert('轨迹数据格式错误: ' + error.message)
      }
    }
    
    const closeDialog = () => {
      showAddDialog.value = false
      Object.assign(newTrajectory, {
        name: '',
        color: '#FF5722',
        dataText: ''
      })
    }
    
    // 生命周期
    onMounted(() => {
      nextTick(() => {
        initialize()
      })
    })
    
    return {
      // refs
      mapContainer,
      progressBar,
      progressHandle,
      
      // state
      isPlayerReady,
      loading,
      error,
      playState,
      timeInfo,
      progress,
      selectedSpeed,
      speedOptions,
      trajectoryList,
      showAddDialog,
      newTrajectory,
      selectedTrajectoryId,
      
      // methods
      retry,
      play,
      pause,
      reset,
      changeSpeed,
      handleProgressClick,
      startDragging,
      toggleTrajectory,
      selectTrajectory,
      addTrajectory,
      closeDialog,
      formatTime,
      formatActualDuration
    }
  }
}
</script>

<style scoped>
.trajectory-player-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  position: relative;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

/* 地图容器 */
.map-container {
  flex: 1;
  width: 100%;
  background-color: #f5f5f5;
  position: relative;
}

.map-loading {
  opacity: 0.5;
}

/* 加载状态 */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #f3f3f3;
  border-top: 4px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* 错误状态 */
.error-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.95);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.error-message {
  text-align: center;
  padding: 32px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  max-width: 400px;
}

.error-message h3 {
  color: #e74c3c;
  margin: 0 0 16px 0;
}

.error-message p {
  color: #666;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

.retry-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

.retry-btn:hover {
  background: #2980b9;
}

/* 控制面板 */
.control-panel {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 16px;
  box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.1);
}

/* 时间显示 */
.time-display {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  font-family: 'Courier New', monospace;
  font-size: 14px;
}

.start-time {
  color: #666;
}

.current-time {
  font-weight: bold;
  color: #2c3e50;
  font-size: 16px;
}

.end-time {
  color: #666;
}

/* 进度条 */
.progress-container {
  margin-bottom: 16px;
}

.progress-bar {
  width: 100%;
  height: 8px;
  background: #e0e0e0;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #3498db, #2980b9);
  border-radius: 4px;
  transition: width 0.1s ease;
}

.progress-handle {
  position: absolute;
  top: -4px;
  width: 16px;
  height: 16px;
  background: white;
  border: 2px solid #3498db;
  border-radius: 50%;
  cursor: grab;
  transform: translateX(-50%);
  transition: transform 0.1s ease;
}

.progress-handle:active {
  cursor: grabbing;
  transform: translateX(-50%) scale(1.2);
}

/* 控制按钮 */
.control-buttons {
  display: flex;
  gap: 12px;
  align-items: center;
}

.control-btn {
  background: #3498db;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  min-width: 80px;
}

.control-btn:hover:not(:disabled) {
  background: #2980b9;
  transform: translateY(-1px);
}

.control-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
  transform: none;
}

.speed-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  background: white;
  cursor: pointer;
  font-size: 14px;
}

/* 轨迹面板 */
.trajectory-panel {
  background: white;
  border-top: 1px solid #e0e0e0;
  padding: 16px;
  max-height: 200px;
  overflow-y: auto;
}

.trajectory-panel h3 {
  margin: 0 0 12px 0;
  color: #2c3e50;
  font-size: 16px;
}

.trajectory-list {
  margin-bottom: 12px;
}

.trajectory-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-bottom: 4px;
}

.trajectory-item:hover {
  background: #f8f9fa;
}

.trajectory-item.selected {
  background: #e3f2fd;
}

.trajectory-color {
  width: 16px;
  height: 16px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid white;
  box-shadow: 0 0 0 1px #ddd;
}

.trajectory-name {
  flex: 1;
  font-size: 14px;
  color: #2c3e50;
}

.trajectory-toggle {
  width: 20px;
  height: 20px;
  border: 2px solid #ddd;
  border-radius: 4px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s;
}

.trajectory-toggle.active {
  background: #27ae60;
  border-color: #27ae60;
}

.trajectory-toggle.active::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
}

.add-btn {
  background: #27ae60;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  width: 100%;
  transition: background-color 0.2s;
}

.add-btn:hover {
  background: #229954;
}

/* 对话框 */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
}

.dialog {
  background: white;
  border-radius: 8px;
  padding: 24px;
  width: 90%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

.dialog h3 {
  margin: 0 0 20px 0;
  color: #2c3e50;
}

.form-group {
  margin-bottom: 16px;
}

.form-group label {
  display: block;
  margin-bottom: 6px;
  color: #2c3e50;
  font-weight: 500;
}

.form-input {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-input:focus {
  outline: none;
  border-color: #3498db;
}

.color-input {
  width: 60px;
  height: 40px;
  padding: 4px;
}

.form-textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  font-family: 'Courier New', monospace;
  resize: vertical;
  min-height: 120px;
  transition: border-color 0.2s;
}

.form-textarea:focus {
  outline: none;
  border-color: #3498db;
}

.dialog-buttons {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 24px;
}

.btn {
  padding: 10px 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
  background: white;
  color: #2c3e50;
}

.btn:hover {
  background: #f8f9fa;
}

.btn.primary {
  background: #3498db;
  color: white;
  border-color: #3498db;
}

.btn.primary:hover {
  background: #2980b9;
  border-color: #2980b9;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .control-buttons {
    flex-wrap: wrap;
  }

  .control-btn {
    min-width: 60px;
    padding: 8px 16px;
    font-size: 12px;
  }

  .trajectory-panel {
    max-height: 150px;
  }

  .dialog {
    width: 95%;
    padding: 16px;
  }
}
</style>
