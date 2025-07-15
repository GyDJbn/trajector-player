/**
 * 轨迹回放播放器类
 * 封装轨迹回放的核心功能，支持多轨迹同时播放
 */
class TrajectoryPlayer {
    constructor(mapContainer, options = {}) {
        this.mapContainer = mapContainer;
        this.options = {
            center: [106.501642, 29.615994], // 默认中心点
            zoom: 16,
            animationDuration: 1000, // 每段动画持续时间(ms)
            ...options
        };
        
        this.map = null;
        this.trajectories = new Map(); // 存储所有轨迹数据
        this.markers = new Map(); // 存储标记点
        this.polylines = new Map(); // 存储轨迹线
        this.animations = new Map(); // 存储动画对象
        
        this.isPlaying = false;
        this.isPaused = false;
        this.currentTime = null;
        this.startTime = null;
        this.endTime = null;
        this.playSpeed = 1;
        
        this.callbacks = {
            onTimeUpdate: null,
            onPlayStateChange: null,
            onProgressChange: null
        };
        
        this.initMap();
    }
    
    /**
     * 初始化地图
     */
    initMap() {
        this.map = new AMap.Map(this.mapContainer, {
            center: this.options.center,
            zoom: this.options.zoom,
            mapStyle: 'amap://styles/normal'
        });
        
        // 地图控件
        // this.map.addControl(new AMap.Scale());
        // this.map.addControl(new AMap.ToolBar());
    }
    
    /**
     * 添加轨迹数据
     * @param {Object} trajectory - 轨迹对象 {id, name, color, data}
     */
    addTrajectory(trajectory) {
        // 数据预处理
        const processedData = this.preprocessTrajectoryData(trajectory.data);
        
        const trajectoryInfo = {
            id: trajectory.id,
            name: trajectory.name,
            color: trajectory.color || '#FF5722',
            data: processedData,
            visible: true,
            marker: null,
            polyline: null,
            currentIndex: 0
        };
        
        this.trajectories.set(trajectory.id, trajectoryInfo);
        this.createTrajectoryVisuals(trajectoryInfo);
        this.updateTimeRange();
        
        return trajectoryInfo;
    }
    
    /**
     * 预处理轨迹数据
     */
    preprocessTrajectoryData(data) {
        return data.map(point => ({
            time: new Date(point.time),
            coords: point.coords,
            lnglat: new AMap.LngLat(point.coords[0], point.coords[1])
        })).sort((a, b) => a.time - b.time);
    }
    
    /**
     * 创建轨迹可视化元素
     */
    createTrajectoryVisuals(trajectory) {
        // 创建轨迹线
        const polyline = new AMap.Polyline({
            path: trajectory.data.map(point => point.lnglat),
            strokeColor: trajectory.color,
            strokeWeight: 4,
            strokeOpacity: 0.6,
            strokeStyle: 'solid'
        });
        
        // 创建移动标记
        const marker = new AMap.Marker({
            position: trajectory.data[0].lnglat,
            icon: this.createMarkerIcon(trajectory.color),
            anchor: 'center',
            zIndex: 100
        });
        
        this.map.add([polyline, marker]);
        
        trajectory.polyline = polyline;
        trajectory.marker = marker;
        
        this.polylines.set(trajectory.id, polyline);
        this.markers.set(trajectory.id, marker);
    }
    
    /**
     * 创建标记图标
     */
    createMarkerIcon(color) {
        return new AMap.Icon({
            size: new AMap.Size(24, 24),
            image: `data:image/svg+xml;base64,${btoa(`
                <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="8" fill="${color}" stroke="white" stroke-width="2"/>
                    <circle cx="12" cy="12" r="3" fill="white"/>
                </svg>
            `)}`
        });
    }
    
    /**
     * 更新时间范围
     */
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
    
    /**
     * 开始播放
     */
    play() {
        if (this.isPlaying) return;

        console.log('播放开始 - 当前状态:', {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            currentTime: this.currentTime,
            endTime: this.endTime,
            needReset: this.currentTime && this.endTime && this.currentTime.getTime() >= this.endTime.getTime()
        });

        // 检查是否需要重置（播放结束后重新开始）
        if (this.currentTime && this.endTime && this.currentTime.getTime() >= this.endTime.getTime()) {
            console.log('播放结束，执行重置');
            this.reset();
        }

        this.isPlaying = true;
        this.isPaused = false;

        this.startAnimation();
        this.notifyPlayStateChange();
    }
    
    /**
     * 暂停播放
     */
    pause() {
        this.isPlaying = false;
        this.isPaused = true;
        this.stopAllAnimations();
        this.notifyPlayStateChange();
    }
    
    /**
     * 重置播放
     */
    reset() {
        console.log('执行重置');
        this.isPlaying = false;
        this.isPaused = false;
        this.currentTime = this.startTime;

        this.stopAllAnimations();
        this.resetAllTrajectories();
        this.notifyTimeUpdate();
        this.notifyPlayStateChange();

        console.log('重置后状态:', {
            isPlaying: this.isPlaying,
            isPaused: this.isPaused,
            currentTime: this.currentTime,
            startTime: this.startTime
        });
    }
    
    /**
     * 跳转到指定时间
     */
    seekTo(time) {
        const wasPlaying = this.isPlaying;
        
        if (this.isPlaying) {
            this.pause();
        }
        
        this.currentTime = new Date(time);
        this.updateAllTrajectoriesPosition();
        this.notifyTimeUpdate();
        
        if (wasPlaying) {
            this.play();
        }
    }
    
    /**
     * 设置播放速度
     */
    setPlaySpeed(speed) {
        this.playSpeed = speed;
        
        if (this.isPlaying) {
            this.pause();
            this.play();
        }
    }
    
    /**
     * 开始动画循环
     */
    startAnimation() {
        const animate = () => {
            if (!this.isPlaying) return;

            // 修复速度逻辑：时间步长 = 基础步长 * 播放速度
            // 0.5倍速：100 * 0.5 = 50ms步长，播放更慢
            // 2倍速：100 * 2 = 200ms步长，播放更快
            const timeStep = 100 * this.playSpeed;
            const nextTime = new Date(this.currentTime.getTime() + timeStep);

            // 使用精确的时间戳比较
            if (nextTime.getTime() >= this.endTime.getTime()) {
                console.log('播放结束 - 设置最终状态');
                this.currentTime = this.endTime;
                this.updateAllTrajectoriesPosition();
                this.isPlaying = false;
                this.isPaused = false; // 确保状态一致性
                this.notifyTimeUpdate();
                this.notifyPlayStateChange();
                console.log('播放结束后状态:', {
                    isPlaying: this.isPlaying,
                    isPaused: this.isPaused,
                    currentTime: this.currentTime,
                    endTime: this.endTime
                });
                return;
            }

            this.currentTime = nextTime;
            this.updateAllTrajectoriesPosition();
            this.notifyTimeUpdate();

            // 动画间隔保持固定，通过时间步长控制速度
            setTimeout(animate, timeStep);
        };

        animate();
    }
    
    /**
     * 更新所有轨迹位置
     */
    updateAllTrajectoriesPosition() {
        this.trajectories.forEach(trajectory => {
            if (trajectory.visible) {
                this.updateTrajectoryPosition(trajectory);
            }
        });
    }
    
    /**
     * 更新单个轨迹位置
     */
    updateTrajectoryPosition(trajectory) {
        const data = trajectory.data;
        let targetIndex = 0;
        
        // 找到当前时间对应的位置
        for (let i = 0; i < data.length - 1; i++) {
            if (this.currentTime >= data[i].time && this.currentTime <= data[i + 1].time) {
                targetIndex = i;
                break;
            } else if (this.currentTime > data[i].time) {
                targetIndex = i;
            }
        }
        
        if (targetIndex < data.length - 1) {
            // 计算插值位置
            const current = data[targetIndex];
            const next = data[targetIndex + 1];
            const progress = (this.currentTime - current.time) / (next.time - current.time);
            
            const lng = current.coords[0] + (next.coords[0] - current.coords[0]) * progress;
            const lat = current.coords[1] + (next.coords[1] - current.coords[1]) * progress;
            
            trajectory.marker.setPosition(new AMap.LngLat(lng, lat));
        } else {
            // 使用最后一个位置
            trajectory.marker.setPosition(data[data.length - 1].lnglat);
        }
    }
    
    /**
     * 停止所有动画
     */
    stopAllAnimations() {
        this.animations.forEach(animation => {
            if (animation) animation.stop();
        });
        this.animations.clear();
    }
    
    /**
     * 重置所有轨迹
     */
    resetAllTrajectories() {
        this.trajectories.forEach(trajectory => {
            if (trajectory.data.length > 0) {
                trajectory.marker.setPosition(trajectory.data[0].lnglat);
                trajectory.currentIndex = 0;
            }
        });
    }
    
    /**
     * 切换轨迹可见性
     */
    toggleTrajectoryVisibility(trajectoryId, visible) {
        const trajectory = this.trajectories.get(trajectoryId);
        if (trajectory) {
            trajectory.visible = visible;
            trajectory.marker.setMap(visible ? this.map : null);
            trajectory.polyline.setMap(visible ? this.map : null);
        }
    }
    
    /**
     * 移除轨迹
     */
    removeTrajectory(trajectoryId) {
        const trajectory = this.trajectories.get(trajectoryId);
        if (trajectory) {
            this.map.remove([trajectory.marker, trajectory.polyline]);
            this.trajectories.delete(trajectoryId);
            this.updateTimeRange();
        }
    }
    
    /**
     * 获取当前进度 (0-1)
     */
    getProgress() {
        if (!this.startTime || !this.endTime) return 0;
        return (this.currentTime - this.startTime) / (this.endTime - this.startTime);
    }
    
    /**
     * 设置回调函数
     */
    setCallbacks(callbacks) {
        this.callbacks = { ...this.callbacks, ...callbacks };
    }
    
    /**
     * 通知时间更新
     */
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
    
    /**
     * 通知播放状态变化
     */
    notifyPlayStateChange() {
        if (this.callbacks.onPlayStateChange) {
            this.callbacks.onPlayStateChange({
                isPlaying: this.isPlaying,
                isPaused: this.isPaused
            });
        }
    }
    
    /**
     * 销毁播放器
     */
    destroy() {
        this.pause();
        this.trajectories.forEach(trajectory => {
            this.map.remove([trajectory.marker, trajectory.polyline]);
        });
        this.trajectories.clear();
        this.markers.clear();
        this.polylines.clear();
        
        if (this.map) {
            this.map.destroy();
        }
    }
}
