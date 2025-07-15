/**
 * 进度条控制组件
 * 处理进度条拖拽、时间显示和播放控制
 */
class ProgressControl {
    constructor(player) {
        this.player = player;
        this.isDragging = false;
        
        // DOM元素
        this.progressBar = document.getElementById('progress-bar');
        this.progressFill = document.getElementById('progress-fill');
        this.progressHandle = document.getElementById('progress-handle');
        
        this.startTimeEl = document.getElementById('start-time');
        this.currentTimeEl = document.getElementById('current-time');
        this.endTimeEl = document.getElementById('end-time');
        
        this.playBtn = document.getElementById('play-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resetBtn = document.getElementById('reset-btn');
        this.speedSelect = document.getElementById('speed-select');
        
        this.initEventListeners();
        this.setupPlayerCallbacks();
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        // 进度条点击
        this.progressBar.addEventListener('click', (e) => {
            if (!this.isDragging) {
                this.handleProgressBarClick(e);
            }
        });
        
        // 进度条拖拽
        this.progressHandle.addEventListener('mousedown', (e) => {
            this.startDragging(e);
        });
        
        // 全局鼠标事件
        document.addEventListener('mousemove', (e) => {
            if (this.isDragging) {
                this.handleDragging(e);
            }
        });
        
        document.addEventListener('mouseup', () => {
            if (this.isDragging) {
                this.stopDragging();
            }
        });
        
        // 播放控制按钮
        this.playBtn.addEventListener('click', () => {
            this.player.play();
        });
        
        this.pauseBtn.addEventListener('click', () => {
            this.player.pause();
        });
        
        this.resetBtn.addEventListener('click', () => {
            this.player.reset();
        });
        
        // 速度选择
        this.speedSelect.addEventListener('change', (e) => {
            this.player.setPlaySpeed(parseFloat(e.target.value));
            // 速度改变后立即更新时间显示
            this.updateTimeDisplay({
                startTime: this.player.startTime,
                endTime: this.player.endTime,
                currentTime: this.player.currentTime
            });
        });
        
        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            this.handleKeyboardShortcuts(e);
        });
    }
    
    /**
     * 设置播放器回调
     */
    setupPlayerCallbacks() {
        this.player.setCallbacks({
            onTimeUpdate: (timeInfo) => {
                this.updateTimeDisplay(timeInfo);
                this.updateProgressBar(timeInfo.progress);
            },
            onPlayStateChange: (stateInfo) => {
                this.updatePlayButtons(stateInfo);
            }
        });
    }
    
    /**
     * 处理进度条点击
     */
    handleProgressBarClick(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const clickX = e.clientX - rect.left;
        const progress = clickX / rect.width;
        
        this.seekToProgress(progress);
    }
    
    /**
     * 开始拖拽
     */
    startDragging(e) {
        this.isDragging = true;
        this.progressHandle.style.cursor = 'grabbing';
        e.preventDefault();
    }
    
    /**
     * 处理拖拽
     */
    handleDragging(e) {
        const rect = this.progressBar.getBoundingClientRect();
        const dragX = e.clientX - rect.left;
        const progress = Math.max(0, Math.min(1, dragX / rect.width));
        
        this.updateProgressBar(progress);
        this.seekToProgress(progress);
    }
    
    /**
     * 停止拖拽
     */
    stopDragging() {
        this.isDragging = false;
        this.progressHandle.style.cursor = 'grab';
    }
    
    /**
     * 根据进度跳转
     */
    seekToProgress(progress) {
        if (!this.player.startTime || !this.player.endTime) return;
        
        const totalDuration = this.player.endTime - this.player.startTime;
        const targetTime = new Date(this.player.startTime.getTime() + totalDuration * progress);
        
        this.player.seekTo(targetTime);
    }
    
    /**
     * 更新时间显示
     */
    updateTimeDisplay(timeInfo) {
        if (timeInfo.startTime) {
            this.startTimeEl.textContent = this.formatTime(timeInfo.startTime);
        }

        if (timeInfo.endTime) {
            // 显示实际播放时长（考虑倍速）
            const actualDuration = this.calculateActualDuration(timeInfo.startTime, timeInfo.endTime);
            this.endTimeEl.textContent = this.formatDuration(actualDuration);
        }

        if (timeInfo.currentTime) {
            this.currentTimeEl.textContent = this.formatTime(timeInfo.currentTime);
        }
    }
    
    /**
     * 更新进度条
     */
    updateProgressBar(progress) {
        if (!this.isDragging) {
            // 确保进度值在0-1之间
            const clampedProgress = Math.max(0, Math.min(1, progress));
            const percentage = clampedProgress * 100;

            // 使用CSS过渡效果使进度条更新更平滑
            this.progressFill.style.width = `${percentage}%`;
            this.progressHandle.style.left = `${percentage}%`;
        }
    }
    
    /**
     * 更新播放按钮状态
     */
    updatePlayButtons(stateInfo) {
        this.playBtn.disabled = stateInfo.isPlaying;
        this.pauseBtn.disabled = !stateInfo.isPlaying;
        
        // 更新按钮文本
        if (stateInfo.isPlaying) {
            this.playBtn.textContent = '播放中...';
        } else if (stateInfo.isPaused) {
            this.playBtn.textContent = '继续';
        } else {
            this.playBtn.textContent = '播放';
        }
    }
    
    /**
     * 处理键盘快捷键
     */
    handleKeyboardShortcuts(e) {
        // 防止在输入框中触发
        if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
            return;
        }
        
        switch (e.code) {
            case 'Space':
                e.preventDefault();
                if (this.player.isPlaying) {
                    this.player.pause();
                } else {
                    this.player.play();
                }
                break;
                
            case 'KeyR':
                e.preventDefault();
                this.player.reset();
                break;
                
            case 'ArrowLeft':
                e.preventDefault();
                this.seekRelative(-5000); // 后退5秒
                break;
                
            case 'ArrowRight':
                e.preventDefault();
                this.seekRelative(5000); // 前进5秒
                break;
                
            case 'Digit1':
                this.speedSelect.value = '0.5';
                this.player.setPlaySpeed(0.5);
                break;
                
            case 'Digit2':
                this.speedSelect.value = '1';
                this.player.setPlaySpeed(1);
                break;
                
            case 'Digit3':
                this.speedSelect.value = '2';
                this.player.setPlaySpeed(2);
                break;
                
            case 'Digit4':
                this.speedSelect.value = '4';
                this.player.setPlaySpeed(4);
                break;
        }
    }
    
    /**
     * 相对时间跳转
     */
    seekRelative(milliseconds) {
        if (!this.player.currentTime) return;
        
        const newTime = new Date(this.player.currentTime.getTime() + milliseconds);
        const clampedTime = new Date(Math.max(
            this.player.startTime.getTime(),
            Math.min(this.player.endTime.getTime(), newTime.getTime())
        ));
        
        this.player.seekTo(clampedTime);
    }
    
    /**
     * 格式化时间显示
     */
    formatTime(date) {
        if (!date) return '--:--:--';

        const hours = date.getHours().toString().padStart(2, '0');
        const minutes = date.getMinutes().toString().padStart(2, '0');
        const seconds = date.getSeconds().toString().padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
    }

    /**
     * 计算实际播放时长（考虑倍速）
     * @param {Date} startTime 开始时间
     * @param {Date} endTime 结束时间
     * @returns {number} 实际播放时长（毫秒）
     */
    calculateActualDuration(startTime, endTime) {
        if (!startTime || !endTime) return 0;

        // 获取轨迹总时长（毫秒）
        const totalDuration = endTime.getTime() - startTime.getTime();

        // 根据播放速度计算实际播放时长
        const actualDuration = totalDuration / this.player.playSpeed;

        return actualDuration;
    }

    /**
     * 格式化时长显示（时:分:秒）
     * @param {number} duration 时长（毫秒）
     * @returns {string} 格式化后的时长
     */
    formatDuration(duration) {
        if (!duration) return '--:--:--';

        // 转换为秒
        let seconds = Math.floor(duration / 1000);

        // 计算小时、分钟、秒
        const hours = Math.floor(seconds / 3600);
        seconds %= 3600;
        const minutes = Math.floor(seconds / 60);
        seconds %= 60;

        // 格式化为 HH:MM:SS
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    /**
     * 格式化日期时间显示
     */
    formatDateTime(date) {
        if (!date) return '--/--/-- --:--:--';
        
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const time = this.formatTime(date);
        
        return `${year}/${month}/${day} ${time}`;
    }
    
    /**
     * 显示详细时间信息（鼠标悬停时）
     */
    showDetailedTime(show = true) {
        if (show && this.player.currentTime) {
            this.currentTimeEl.title = this.formatDateTime(this.player.currentTime);
        } else {
            this.currentTimeEl.title = '';
        }
    }
    
    /**
     * 设置进度条主题色
     */
    setThemeColor(color) {
        this.progressFill.style.background = `linear-gradient(90deg, ${color}, ${color}aa)`;
        this.progressHandle.style.borderColor = color;
    }
    
    /**
     * 销毁控制器
     */
    destroy() {
        // 移除事件监听器
        document.removeEventListener('mousemove', this.handleDragging);
        document.removeEventListener('mouseup', this.stopDragging);
        document.removeEventListener('keydown', this.handleKeyboardShortcuts);
    }
}
