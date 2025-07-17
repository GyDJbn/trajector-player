import { ref, reactive, onMounted, onUnmounted, nextTick } from 'vue'
import AMapLoader from '@amap/amap-jsapi-loader'
import { TrajectoryPlayer } from '../lib/TrajectoryPlayer.js'

/**
 * 轨迹播放器组合式函数
 * 使用@amap/amap-jsapi-loader加载高德地图API
 * 封装轨迹播放器的所有逻辑
 */
export function useTrajectoryPlayer(options = {}) {
    // 响应式数据
    const mapContainer = ref(null)
    const player = ref(null)
    const isMapLoaded = ref(false)
    const isPlayerReady = ref(false)
    const loading = ref(false)
    const error = ref(null)
    
    // 播放状态
    const playState = reactive({
        isPlaying: false,
        isPaused: false
    })
    
    // 时间信息
    const timeInfo = reactive({
        startTime: null,
        currentTime: null,
        endTime: null
    })
    
    // 进度信息
    const progress = ref(0)
    const selectedSpeed = ref(1)
    const speedOptions = [0.5, 1, 2, 4]
    
    // 轨迹列表
    const trajectoryList = ref([])
    
    // 默认配置
    const defaultConfig = {
        key: '', // 高德地图API密钥
        version: '2.0',
        plugins: [],
        mapOptions: {
            center: [106.501642, 29.615994],
            zoom: 15
        },
        ...options
    }
    
    /**
     * 加载高德地图API
     */
    const loadAMapAPI = async () => {
        if (!defaultConfig.key) {
            throw new Error('高德地图API密钥未配置')
        }
        
        try {
            loading.value = true
            error.value = null
            
            const AMap = await AMapLoader.load({
                key: defaultConfig.key,
                version: defaultConfig.version,
                plugins: defaultConfig.plugins
            })
            
            isMapLoaded.value = true
            return AMap
        } catch (err) {
            error.value = `加载高德地图API失败: ${err.message}`
            throw err
        } finally {
            loading.value = false
        }
    }
    
    /**
     * 初始化播放器
     */
    const initPlayer = async () => {
        if (!mapContainer.value) {
            throw new Error('地图容器未准备好')
        }
        
        try {
            // 加载高德地图API
            const AMap = await loadAMapAPI()
            
            // 创建播放器实例
            player.value = new TrajectoryPlayer(mapContainer.value, defaultConfig.mapOptions)
            
            // 初始化地图
            player.value.initMap(AMap)
            
            // 设置回调函数
            player.value.setCallbacks({
                onTimeUpdate: handleTimeUpdate,
                onPlayStateChange: handlePlayStateChange
            })
            
            isPlayerReady.value = true
            
            return player.value
        } catch (err) {
            error.value = `初始化播放器失败: ${err.message}`
            throw err
        }
    }
    
    /**
     * 时间更新回调
     */
    const handleTimeUpdate = (info) => {
        Object.assign(timeInfo, info)
        progress.value = info.progress
    }
    
    /**
     * 播放状态变化回调
     */
    const handlePlayStateChange = (state) => {
        Object.assign(playState, state)
    }
    
    /**
     * 添加轨迹
     */
    const addTrajectory = (trajectory) => {
        if (!player.value) {
            throw new Error('播放器未初始化')
        }
        
        try {
            const addedTrajectory = player.value.addTrajectory(trajectory)
            trajectoryList.value.push({
                ...addedTrajectory,
                visible: true
            })
            return addedTrajectory
        } catch (err) {
            error.value = `添加轨迹失败: ${err.message}`
            throw err
        }
    }
    
    /**
     * 移除轨迹
     */
    const removeTrajectory = (trajectoryId) => {
        if (!player.value) return
        
        player.value.removeTrajectory(trajectoryId)
        const index = trajectoryList.value.findIndex(t => t.id === trajectoryId)
        if (index > -1) {
            trajectoryList.value.splice(index, 1)
        }
    }
    
    /**
     * 切换轨迹可见性
     */
    const toggleTrajectoryVisibility = (trajectoryId, visible) => {
        if (!player.value) return
        
        player.value.toggleTrajectoryVisibility(trajectoryId, visible)
        const trajectory = trajectoryList.value.find(t => t.id === trajectoryId)
        if (trajectory) {
            trajectory.visible = visible
        }
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
    
    const setPlaySpeed = (speed) => {
        selectedSpeed.value = speed
        if (!player.value) return
        player.value.setPlaySpeed(speed)
    }
    
    /**
     * 跳转到进度位置
     */
    const seekToProgress = (progressValue) => {
        if (!player.value || !timeInfo.startTime || !timeInfo.endTime) return
        
        const totalDuration = timeInfo.endTime - timeInfo.startTime
        const targetTime = new Date(timeInfo.startTime.getTime() + totalDuration * progressValue)
        seekTo(targetTime)
    }
    
    /**
     * 格式化时间显示
     */
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
    
    /**
     * 销毁播放器
     */
    const destroy = () => {
        if (player.value) {
            player.value.destroy()
            player.value = null
        }
        isPlayerReady.value = false
        isMapLoaded.value = false
        trajectoryList.value = []
    }
    
    // 生命周期钩子
    onUnmounted(() => {
        destroy()
    })
    
    return {
        // refs
        mapContainer,
        player,
        isMapLoaded,
        isPlayerReady,
        loading,
        error,
        
        // reactive data
        playState,
        timeInfo,
        progress,
        selectedSpeed,
        speedOptions,
        trajectoryList,
        
        // methods
        initPlayer,
        addTrajectory,
        removeTrajectory,
        toggleTrajectoryVisibility,
        play,
        pause,
        reset,
        seekTo,
        setPlaySpeed,
        seekToProgress,
        formatTime,
        formatActualDuration,
        destroy
    }
}
