<template>
  <div class="trajectory-player-container">
    <!-- 地图容器 -->
    <div ref="mapContainer" class="map-container"></div>
    
    <!-- 控制面板 -->
    <div class="control-panel">
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
    <div class="trajectory-panel">
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
    <el-dialog 
      v-model="showAddDialog" 
      title="添加轨迹数据" 
      width="500px"
      v-if="showAddDialog"
    >
      <el-form :model="newTrajectory" label-width="100px">
        <el-form-item label="轨迹名称">
          <el-input v-model="newTrajectory.name" placeholder="请输入轨迹名称"></el-input>
        </el-form-item>
        <el-form-item label="轨迹颜色">
          <el-color-picker v-model="newTrajectory.color"></el-color-picker>
        </el-form-item>
        <el-form-item label="轨迹数据">
          <el-input 
            v-model="newTrajectory.dataText" 
            type="textarea" 
            :rows="8"
            placeholder="请输入JSON格式的轨迹数据"
          ></el-input>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showAddDialog = false">取消</el-button>
        <el-button type="primary" @click="addTrajectory">添加</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script>
import { ref, reactive, onMounted, onUnmounted, watch, nextTick } from 'vue'

export default {
  name: 'TrajectoryPlayer',
  props: {
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
    // 高德地图API密钥
    amapKey: {
      type: String,
      required: true
    }
  },
  emits: [
    'time-update',
    'play-state-change', 
    'trajectory-add',
    'trajectory-remove',
    'trajectory-select'
  ],
  setup(props, { emit }) {
    // 响应式数据
    const mapContainer = ref(null)
    const progressBar = ref(null)
    const progressHandle = ref(null)
    
    const player = ref(null)
    const showAddDialog = ref(false)
    const selectedTrajectoryId = ref(null)
    const isDragging = ref(false)
    
    const timeInfo = reactive({
      startTime: null,
      currentTime: null,
      endTime: null
    })
    
    const playState = reactive({
      isPlaying: false,
      isPaused: false
    })
    
    const progress = ref(0)
    const selectedSpeed = ref(1)
    const speedOptions = [0.5, 1, 2, 4]
    
    const trajectoryList = ref([])
    
    const newTrajectory = reactive({
      name: '',
      color: '#FF5722',
      dataText: ''
    })
    
    // 方法
    const initPlayer = async () => {
      // 等待高德地图API加载
      await loadAMapAPI()
      
      // 动态导入轨迹播放器类
      const { TrajectoryPlayer } = await import('../trajectory-player.js')
      
      player.value = new TrajectoryPlayer(mapContainer.value, props.mapOptions)
      
      // 设置回调
      player.value.setCallbacks({
        onTimeUpdate: (info) => {
          Object.assign(timeInfo, info)
          progress.value = info.progress
          emit('time-update', info)
        },
        onPlayStateChange: (state) => {
          Object.assign(playState, state)
          emit('play-state-change', state)
        }
      })
      
      // 加载初始轨迹
      props.initialTrajectories.forEach(trajectory => {
        addTrajectoryToPlayer(trajectory)
      })
    }
    
    const loadAMapAPI = () => {
      return new Promise((resolve, reject) => {
        if (typeof AMap !== 'undefined') {
          resolve()
          return
        }
        
        const script = document.createElement('script')
        script.src = `https://webapi.amap.com/maps?v=2.0&key=${props.amapKey}`
        script.onload = resolve
        script.onerror = reject
        document.head.appendChild(script)
      })
    }
    
    const addTrajectoryToPlayer = (trajectory) => {
      const addedTrajectory = player.value.addTrajectory(trajectory)
      trajectoryList.value.push({
        ...addedTrajectory,
        visible: true
      })
    }
    
    // 播放控制方法
    const play = () => player.value?.play()
    const pause = () => player.value?.pause()
    const reset = () => player.value?.reset()
    const changeSpeed = () => {
      if (player.value) {
        player.value.setPlaySpeed(selectedSpeed.value)
        // 速度改变后强制更新时间显示
        nextTick(() => {
          // 触发重新渲染以更新实际播放时长显示
        })
      }
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
        
        progress.value = newProgress
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
    
    const seekToProgress = (progressValue) => {
      if (!player.value || !timeInfo.startTime || !timeInfo.endTime) return
      
      const totalDuration = timeInfo.endTime - timeInfo.startTime
      const targetTime = new Date(timeInfo.startTime.getTime() + totalDuration * progressValue)
      player.value.seekTo(targetTime)
    }
    
    // 轨迹管理
    const toggleTrajectory = (trajectoryId) => {
      const trajectory = trajectoryList.value.find(t => t.id === trajectoryId)
      if (trajectory) {
        trajectory.visible = !trajectory.visible
        player.value.toggleTrajectoryVisibility(trajectoryId, trajectory.visible)
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
        
        showAddDialog.value = false
        Object.assign(newTrajectory, {
          name: '',
          color: '#FF5722',
          dataText: ''
        })
      } catch (error) {
        console.error('轨迹数据格式错误:', error)
      }
    }
    
    const formatTime = (date) => {
      if (!date) return '--:--:--'

      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')

      return `${hours}:${minutes}:${seconds}`
    }

    /**
     * 计算并格式化实际播放时长（考虑倍速）
     */
    const formatActualDuration = (startTime, endTime) => {
      if (!startTime || !endTime) return '--:--:--'

      // 获取轨迹总时长（毫秒）
      const totalDuration = endTime.getTime() - startTime.getTime()

      // 根据播放速度计算实际播放时长
      const actualDuration = totalDuration / selectedSpeed.value

      // 转换为秒
      let seconds = Math.floor(actualDuration / 1000)

      // 计算小时、分钟、秒
      const hours = Math.floor(seconds / 3600)
      seconds %= 3600
      const minutes = Math.floor(seconds / 60)
      seconds %= 60

      // 格式化为 HH:MM:SS
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
    }
    
    // 生命周期
    onMounted(() => {
      nextTick(() => {
        initPlayer()
      })
    })
    
    onUnmounted(() => {
      player.value?.destroy()
    })
    
    // 监听轨迹数据变化
    watch(() => props.initialTrajectories, (newTrajectories) => {
      if (player.value) {
        // 清空现有轨迹
        trajectoryList.value.forEach(trajectory => {
          player.value.removeTrajectory(trajectory.id)
        })
        trajectoryList.value = []
        
        // 添加新轨迹
        newTrajectories.forEach(trajectory => {
          addTrajectoryToPlayer(trajectory)
        })
      }
    }, { deep: true })
    
    return {
      // refs
      mapContainer,
      progressBar,
      progressHandle,
      
      // reactive data
      timeInfo,
      playState,
      progress,
      selectedSpeed,
      speedOptions,
      trajectoryList,
      showAddDialog,
      newTrajectory,
      selectedTrajectoryId,
      
      // methods
      play,
      pause,
      reset,
      changeSpeed,
      handleProgressClick,
      startDragging,
      toggleTrajectory,
      selectTrajectory,
      addTrajectory,
      formatTime,
      formatActualDuration
    }
  }
}
</script>

<style scoped>
/* 这里可以导入之前的CSS样式，或者使用CSS Modules */
@import '../style.css';

.trajectory-player-container {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.map-container {
  flex: 1;
  width: 100%;
}
</style>
