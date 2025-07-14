/**
 * 轨迹回放系统配置文件
 * 可以根据需要修改这些配置项
 */
const TrajectoryConfig = {
    // 地图配置
    map: {
        // 默认中心点（重庆市中心）
        defaultCenter: [106.501642, 29.615994],
        // 默认缩放级别
        defaultZoom: 15,
        // 地图样式
        mapStyle: 'amap://styles/normal', // 可选: normal, dark, light, fresh, grey, graffiti, macaron, blue, darkblue, wine
        // 是否显示地图控件
        showControls: true
    },
    
    // 动画配置
    animation: {
        // 每段动画持续时间(毫秒)
        duration: 1000,
        // 动画更新间隔(毫秒)
        updateInterval: 100,
        // 默认播放速度
        defaultSpeed: 1,
        // 可用的播放速度选项
        speedOptions: [0.5, 1, 2, 4, 8]
    },
    
    // 轨迹样式配置
    trajectory: {
        // 默认轨迹颜色
        defaultColors: [
            '#FF5722', '#2196F3', '#4CAF50', '#FF9800', 
            '#9C27B0', '#00BCD4', '#795548', '#607D8B'
        ],
        // 轨迹线样式
        polyline: {
            strokeWeight: 4,
            strokeOpacity: 0.6,
            strokeStyle: 'solid'
        },
        // 标记点样式
        marker: {
            size: 24,
            zIndex: 100
        }
    },
    
    // 进度条配置
    progressBar: {
        // 进度条高度
        height: 8,
        // 进度条颜色
        fillColor: '#2196F3',
        // 进度条背景色
        backgroundColor: '#e0e0e0',
        // 拖拽手柄大小
        handleSize: 20
    },
    
    // 时间显示配置
    timeDisplay: {
        // 时间格式
        format: 'HH:mm:ss', // 可选: HH:mm:ss, YYYY/MM/DD HH:mm:ss
        // 是否显示毫秒
        showMilliseconds: false,
        // 时区偏移（小时）
        timezoneOffset: 8 // 中国时区 UTC+8
    },
    
    // 键盘快捷键配置
    keyboard: {
        // 是否启用键盘快捷键
        enabled: true,
        // 快进/快退步长（毫秒）
        seekStep: 5000,
        // 快捷键映射
        shortcuts: {
            play: 'Space',
            reset: 'KeyR',
            seekBackward: 'ArrowLeft',
            seekForward: 'ArrowRight',
            speed05: 'Digit1',
            speed1: 'Digit2',
            speed2: 'Digit3',
            speed4: 'Digit4'
        }
    },
    
    // 性能配置
    performance: {
        // 最大轨迹点数（超过此数量会进行抽样）
        maxTrajectoryPoints: 1000,
        // 抽样间隔（毫秒）
        samplingInterval: 1000,
        // 是否启用轨迹点抽样
        enableSampling: true
    },
    
    // UI配置
    ui: {
        // 轨迹面板位置 'right' | 'left' | 'bottom'
        trajectoryPanelPosition: 'right',
        // 控制面板高度
        controlPanelHeight: 120,
        // 是否显示轨迹统计信息
        showTrajectoryStats: true,
        // 主题色
        primaryColor: '#2196F3',
        // 成功色
        successColor: '#4CAF50',
        // 警告色
        warningColor: '#FF9800',
        // 错误色
        errorColor: '#F44336'
    },
    
    // 数据配置
    data: {
        // 时间字段名
        timeField: 'time',
        // 坐标字段名
        coordsField: 'coords',
        // 支持的时间格式
        timeFormats: [
            'YYYY/MM/DD HH:mm:ss',
            'YYYY-MM-DD HH:mm:ss',
            'YYYY/MM/DD HH:mm:ss.SSS',
            'timestamp' // Unix时间戳
        ],
        // 坐标系统 'gcj02' | 'wgs84'
        coordinateSystem: 'gcj02'
    },
    
    // 调试配置
    debug: {
        // 是否启用调试模式
        enabled: false,
        // 是否显示性能信息
        showPerformance: false,
        // 是否记录详细日志
        verboseLogging: false
    }
};

// 导出配置（如果在模块环境中使用）
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TrajectoryConfig;
}

// 全局配置访问器
window.TrajectoryConfig = TrajectoryConfig;
