import { createApp } from 'vue'
import App from './App.vue'
import '../api-config.js'

// 创建Vue应用实例
const app = createApp(App)

// 挂载应用
app.mount('#app')
