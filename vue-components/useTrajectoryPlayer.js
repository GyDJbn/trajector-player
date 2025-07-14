/**
 * Vue Composable Hook for Trajectory Player
 * 提供轨迹播放器的响应式状态管理和方法
 */
import { ref, reactive, onMounted, onUnmounted, watch } from 'vue'

export function useTrajectoryPlayer(options = {}) {
  // 默认配置
  const defaultOptions = {
    mapContainer: null,
    mapOptions: {
      center: [106.501642, 29.615994],
      zoom: 15
    },
    amapKey: '',
    autoInit: true
  }
  
  const config = { ...defaultOptions, ...options }
  
  // 响应式状态
  const player = ref(null)
  const isInitialized = ref(false)
  const isLoading = ref(false)
  const error = ref(null)
  
  // 播放状态
  const playState = reactive({
    isPlaying: false,
    isPaused: false,
    currentSpeed: 1
  })
  
  // 时间信息
  const timeInfo = reactive({
    startTime: null,
    currentTime: null,
    endTime: null,
    progress: 0,
    duration: 0
  })
  
  // 轨迹列表
  const trajectories = ref([])
  const selectedTrajectoryId = ref(null)
  
  /**
   * 初始化播放器
   */
  const initPlayer = async (container = config.mapContainer) => {
    if (isInitialized.value) return player.value
    
    try {
      isLoading.value = true
      error.value = null
      
      // 加载高德地图API
      await loadAMapAPI(config.amapKey)
      
      // 动态导入播放器类
      const { TrajectoryPlayer } = await import('../trajectory-player.js')
      
      // 创建播放器实例
      player.value = new TrajectoryPlayer(container, config.mapOptions)
      
      // 设置回调函数
      setupCallbacks()
      
      isInitialized.value = true
      return player.value
      
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      isLoading.value = false
    }
  }
  
  /**
   * 加载高德地图API
   */
  const loadAMapAPI = (apiKey) => {
    return new Promise((resolve, reject) => {
      if (typeof AMap !== 'undefined') {
        resolve()
        return
      }
      
      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=${apiKey}`
      script.onload = resolve
      script.onerror = () => reject(new Error('高德地图API加载失败'))
      document.head.appendChild(script)
    })
  }
  
  /**
   * 设置播放器回调
   */
  const setupCallbacks = () => {
    if (!player.value) return
    
    player.value.setCallbacks({
      onTimeUpdate: (info) => {
        Object.assign(timeInfo, {
          ...info,
          duration: info.endTime && info.startTime ? 
            info.endTime - info.startTime : 0
        })
      },
      onPlayStateChange: (state) => {
        Object.assign(playState, state)
      }
    })
  }
  
  /**
   * 播放控制方法
   */
  const play = () => {
    if (!player.value) return
    player.value.play()
  }
  
  const pause = () => {
    if (!player.value) return
    player.value.pause()
  }
  
  const reset = () => {
    if (!player.value) return
    player.value.reset()
  }
  
  const seekTo = (time) => {
    if (!player.value) return
    player.value.seekTo(time)
  }
  
  const seekToProgress = (progress) => {
    if (!player.value || !timeInfo.startTime || !timeInfo.endTime) return
    
    const totalDuration = timeInfo.endTime - timeInfo.startTime
    const targetTime = new Date(timeInfo.startTime.getTime() + totalDuration * progress)
    player.value.seekTo(targetTime)
  }
  
  const setPlaySpeed = (speed) => {
    if (!player.value) return
    player.value.setPlaySpeed(speed)
    playState.currentSpeed = speed
  }
  
  /**
   * 轨迹管理方法
   */
  const addTrajectory = (trajectory) => {
    if (!player.value) return null
    
    const addedTrajectory = player.value.addTrajectory(trajectory)
    trajectories.value.push({
      ...addedTrajectory,
      visible: true
    })
    
    return addedTrajectory
  }
  
  const removeTrajectory = (trajectoryId) => {
    if (!player.value) return
    
    player.value.removeTrajectory(trajectoryId)
    const index = trajectories.value.findIndex(t => t.id === trajectoryId)
    if (index > -1) {
      trajectories.value.splice(index, 1)
    }
    
    if (selectedTrajectoryId.value === trajectoryId) {
      selectedTrajectoryId.value = null
    }
  }
  
  const toggleTrajectoryVisibility = (trajectoryId, visible) => {
    if (!player.value) return
    
    player.value.toggleTrajectoryVisibility(trajectoryId, visible)
    const trajectory = trajectories.value.find(t => t.id === trajectoryId)
    if (trajectory) {
      trajectory.visible = visible
    }
  }
  
  const selectTrajectory = (trajectoryId) => {
    selectedTrajectoryId.value = trajectoryId
  }
  
  const clearAllTrajectories = () => {
    trajectories.value.forEach(trajectory => {
      removeTrajectory(trajectory.id)
    })
  }
  
  /**
   * 批量操作方法
   */
  const loadTrajectories = (trajectoryList) => {
    clearAllTrajectories()
    trajectoryList.forEach(trajectory => {
      addTrajectory(trajectory)
    })
  }
  
  const exportTrajectories = () => {
    return trajectories.value.map(trajectory => ({
      id: trajectory.id,
      name: trajectory.name,
      color: trajectory.color,
      data: trajectory.data,
      visible: trajectory.visible
    }))
  }
  
  /**
   * 工具方法
   */
  const formatTime = (date) => {
    if (!date) return '--:--:--'
    
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    const seconds = date.getSeconds().toString().padStart(2, '0')
    
    return `${hours}:${minutes}:${seconds}`
  }
  
  const formatDuration = (milliseconds) => {
    if (!milliseconds) return '--:--:--'
    
    const totalSeconds = Math.floor(milliseconds / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }
  
  /**
   * 销毁播放器
   */
  const destroy = () => {
    if (player.value) {
      player.value.destroy()
      player.value = null
    }
    isInitialized.value = false
  }
  
  // 自动初始化
  if (config.autoInit && config.mapContainer) {
    onMounted(() => {
      initPlayer(config.mapContainer)
    })
  }
  
  // 自动销毁
  onUnmounted(() => {
    destroy()
  })
  
  return {
    // 状态
    player: readonly(player),
    isInitialized: readonly(isInitialized),
    isLoading: readonly(isLoading),
    error: readonly(error),
    playState: readonly(playState),
    timeInfo: readonly(timeInfo),
    trajectories: readonly(trajectories),
    selectedTrajectoryId,
    
    // 初始化方法
    initPlayer,
    destroy,
    
    // 播放控制
    play,
    pause,
    reset,
    seekTo,
    seekToProgress,
    setPlaySpeed,
    
    // 轨迹管理
    addTrajectory,
    removeTrajectory,
    toggleTrajectoryVisibility,
    selectTrajectory,
    clearAllTrajectories,
    loadTrajectories,
    exportTrajectories,
    
    // 工具方法
    formatTime,
    formatDuration
  }
}

/**
 * 轨迹数据验证Hook
 */
export function useTrajectoryValidator() {
  const validateTrajectoryData = (data) => {
    const errors = []
    
    if (!Array.isArray(data)) {
      errors.push('轨迹数据必须是数组格式')
      return { isValid: false, errors }
    }
    
    if (data.length === 0) {
      errors.push('轨迹数据不能为空')
      return { isValid: false, errors }
    }
    
    data.forEach((point, index) => {
      if (!point.time) {
        errors.push(`第${index + 1}个数据点缺少时间字段`)
      }
      
      if (!point.coords || !Array.isArray(point.coords) || point.coords.length !== 2) {
        errors.push(`第${index + 1}个数据点坐标格式错误`)
      }
      
      if (point.coords && (
        typeof point.coords[0] !== 'number' || 
        typeof point.coords[1] !== 'number'
      )) {
        errors.push(`第${index + 1}个数据点坐标必须是数字`)
      }
    })
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  const validateTrajectory = (trajectory) => {
    const errors = []
    
    if (!trajectory.id) {
      errors.push('轨迹必须有唯一标识ID')
    }
    
    if (!trajectory.name) {
      errors.push('轨迹必须有名称')
    }
    
    if (!trajectory.data) {
      errors.push('轨迹必须有数据')
    } else {
      const dataValidation = validateTrajectoryData(trajectory.data)
      if (!dataValidation.isValid) {
        errors.push(...dataValidation.errors)
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }
  
  return {
    validateTrajectoryData,
    validateTrajectory
  }
}
