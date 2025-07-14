/**
 * 主应用程序
 * 整合轨迹播放器和控制组件
 */
class TrajectoryApp {
    constructor() {
        this.player = null;
        this.progressControl = null;
        this.trajectoryManager = null;
        
        this.init();
    }
    
    /**
     * 初始化应用
     */
    async init() {
        try {
            // 等待高德地图API加载完成
            await this.waitForAMapAPI();
            
            // 初始化轨迹播放器
            this.player = new TrajectoryPlayer('map-container', {
                center: [106.501642, 29.615994],
                zoom: 15
            });
            
            // 初始化进度控制
            this.progressControl = new ProgressControl(this.player);
            
            // 初始化轨迹管理器
            this.trajectoryManager = new TrajectoryManager(this.player);
            
            // 加载示例数据
            this.loadSampleData();
            
            console.log('轨迹回放应用初始化完成');
            
        } catch (error) {
            console.error('应用初始化失败:', error);
            this.showError('应用初始化失败，请检查网络连接和API密钥');
        }
    }
    
    /**
     * 等待高德地图API加载
     */
    waitForAMapAPI() {
        return new Promise((resolve, reject) => {
            if (typeof AMap !== 'undefined') {
                resolve();
                return;
            }
            
            let attempts = 0;
            const maxAttempts = 50;
            
            const checkAPI = () => {
                attempts++;
                if (typeof AMap !== 'undefined') {
                    resolve();
                } else if (attempts >= maxAttempts) {
                    reject(new Error('高德地图API加载超时'));
                } else {
                    setTimeout(checkAPI, 100);
                }
            };
            
            checkAPI();
        });
    }
    
    /**
     * 加载示例数据
     */
    loadSampleData() {
        if (typeof sampleTrajectories !== 'undefined') {
            sampleTrajectories.forEach(trajectory => {
                this.player.addTrajectory(trajectory);
                this.trajectoryManager.addTrajectoryToList(trajectory);
            });
        }
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'error-message';
        errorDiv.innerHTML = `
            <div style="
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: #ff5722;
                color: white;
                padding: 20px;
                border-radius: 8px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                z-index: 10000;
                max-width: 400px;
                text-align: center;
            ">
                <h3>错误</h3>
                <p>${message}</p>
                <button onclick="this.parentElement.parentElement.remove()" 
                        style="margin-top: 10px; padding: 8px 16px; background: white; color: #ff5722; border: none; border-radius: 4px; cursor: pointer;">
                    确定
                </button>
            </div>
        `;
        document.body.appendChild(errorDiv);
    }
}

/**
 * 轨迹管理器
 * 处理轨迹列表的显示和交互
 */
class TrajectoryManager {
    constructor(player) {
        this.player = player;
        this.trajectoryList = document.getElementById('trajectory-list');
        this.addBtn = document.getElementById('add-trajectory-btn');
        
        this.initEventListeners();
    }
    
    /**
     * 初始化事件监听器
     */
    initEventListeners() {
        this.addBtn.addEventListener('click', () => {
            this.showAddTrajectoryDialog();
        });
    }
    
    /**
     * 添加轨迹到列表
     */
    addTrajectoryToList(trajectory) {
        const item = document.createElement('div');
        item.className = 'trajectory-item active';
        item.dataset.trajectoryId = trajectory.id;
        
        item.innerHTML = `
            <div class="trajectory-color" style="background-color: ${trajectory.color}"></div>
            <span class="trajectory-name">${trajectory.name}</span>
            <div class="trajectory-toggle active" data-trajectory-id="${trajectory.id}"></div>
        `;
        
        // 添加切换事件
        const toggle = item.querySelector('.trajectory-toggle');
        toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleTrajectory(trajectory.id, toggle);
        });
        
        // 添加点击选中事件
        item.addEventListener('click', () => {
            this.selectTrajectory(trajectory.id);
        });
        
        this.trajectoryList.appendChild(item);
    }
    
    /**
     * 切换轨迹显示
     */
    toggleTrajectory(trajectoryId, toggleElement) {
        const isActive = toggleElement.classList.contains('active');
        const newState = !isActive;
        
        toggleElement.classList.toggle('active', newState);
        this.player.toggleTrajectoryVisibility(trajectoryId, newState);
        
        // 更新父元素状态
        const item = toggleElement.closest('.trajectory-item');
        item.classList.toggle('active', newState);
    }
    
    /**
     * 选中轨迹
     */
    selectTrajectory(trajectoryId) {
        // 移除其他选中状态
        this.trajectoryList.querySelectorAll('.trajectory-item').forEach(item => {
            item.classList.remove('selected');
        });
        
        // 添加选中状态
        const selectedItem = this.trajectoryList.querySelector(`[data-trajectory-id="${trajectoryId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }
        
        // 可以在这里添加更多选中后的操作，比如显示轨迹详情
    }
    
    /**
     * 显示添加轨迹对话框
     */
    showAddTrajectoryDialog() {
        const dialog = document.createElement('div');
        dialog.className = 'add-trajectory-dialog';
        dialog.innerHTML = `
            <div style="
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0,0,0,0.5);
                z-index: 10000;
                display: flex;
                align-items: center;
                justify-content: center;
            ">
                <div style="
                    background: white;
                    padding: 30px;
                    border-radius: 8px;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.3);
                    max-width: 500px;
                    width: 90%;
                ">
                    <h3 style="margin-bottom: 20px;">添加轨迹数据</h3>
                    <div style="margin-bottom: 15px;">
                        <label>轨迹名称:</label>
                        <input type="text" id="trajectory-name" placeholder="请输入轨迹名称" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 15px;">
                        <label>轨迹颜色:</label>
                        <input type="color" id="trajectory-color" value="#FF5722" style="width: 100%; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px;">
                    </div>
                    <div style="margin-bottom: 20px;">
                        <label>轨迹数据 (JSON格式):</label>
                        <textarea id="trajectory-data" placeholder="请输入轨迹数据..." style="width: 100%; height: 200px; padding: 8px; margin-top: 5px; border: 1px solid #ddd; border-radius: 4px; font-family: monospace;"></textarea>
                    </div>
                    <div style="text-align: right;">
                        <button onclick="this.closest('.add-trajectory-dialog').remove()" style="margin-right: 10px; padding: 8px 16px; background: #ccc; border: none; border-radius: 4px; cursor: pointer;">取消</button>
                        <button id="confirm-add-trajectory" style="padding: 8px 16px; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">添加</button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(dialog);
        
        // 添加确认事件
        dialog.querySelector('#confirm-add-trajectory').addEventListener('click', () => {
            this.handleAddTrajectory(dialog);
        });
        
        // 填入示例数据
        dialog.querySelector('#trajectory-name').value = '新轨迹';
        dialog.querySelector('#trajectory-data').value = JSON.stringify([
            { time: '2025/07/14 16:00:00', coords: [106.500000, 29.616000] },
            { time: '2025/07/14 16:01:00', coords: [106.501000, 29.616100] },
            { time: '2025/07/14 16:02:00', coords: [106.502000, 29.616200] }
        ], null, 2);
    }
    
    /**
     * 处理添加轨迹
     */
    handleAddTrajectory(dialog) {
        try {
            const name = dialog.querySelector('#trajectory-name').value.trim();
            const color = dialog.querySelector('#trajectory-color').value;
            const dataText = dialog.querySelector('#trajectory-data').value.trim();
            
            if (!name) {
                alert('请输入轨迹名称');
                return;
            }
            
            if (!dataText) {
                alert('请输入轨迹数据');
                return;
            }
            
            const data = JSON.parse(dataText);
            
            if (!Array.isArray(data) || data.length === 0) {
                alert('轨迹数据格式错误，应为数组格式');
                return;
            }
            
            // 验证数据格式
            for (let i = 0; i < data.length; i++) {
                const point = data[i];
                if (!point.time || !point.coords || !Array.isArray(point.coords) || point.coords.length !== 2) {
                    alert(`第${i + 1}个数据点格式错误`);
                    return;
                }
            }
            
            const trajectory = {
                id: 'trajectory_' + Date.now(),
                name: name,
                color: color,
                data: data
            };
            
            this.player.addTrajectory(trajectory);
            this.addTrajectoryToList(trajectory);
            
            dialog.remove();
            
        } catch (error) {
            alert('数据格式错误: ' + error.message);
        }
    }
    
    /**
     * 移除轨迹
     */
    removeTrajectory(trajectoryId) {
        this.player.removeTrajectory(trajectoryId);
        const item = this.trajectoryList.querySelector(`[data-trajectory-id="${trajectoryId}"]`);
        if (item) {
            item.remove();
        }
    }
}

// 应用启动
document.addEventListener('DOMContentLoaded', () => {
    window.trajectoryApp = new TrajectoryApp();
});

// 全局错误处理
window.addEventListener('error', (e) => {
    console.error('全局错误:', e.error);
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('未处理的Promise拒绝:', e.reason);
});
