// 发布阶段打包入口
import Vue from 'vue'
import App from './App.vue'
import router from './router'
// 通过CDN方式引用降低打包大小
// import './plugins/element.js'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入全局样式表
import './assets/css/global.css'
// 安装树形表格组件
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// 导入富文本编辑器对应的样式 css样式表也会多合并到import集合文件导致体积很大因此开发模式下打包还需要放入public index
// import 'quill/dist/quill.core.css'
// import 'quill/dist/quill.snow.css'
// import 'quill/dist/quill.bubble.css'
// 导入NProgress包对应的js和css事件加载进度条
import NProgress from 'nprogress'
// import 'nprogress/nprogress.css'
import axios from 'axios'
// 配置请求的跟路径
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
// 在request拦截器中展示进度条
axios.interceptors.request.use(config => {
  NProgress.start()
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
// 在response拦截器中隐藏进度条NProgress.done()
axios.interceptors.response.use(config => {
  NProgress.done()
  return config
})
Vue.prototype.$http = axios

Vue.config.productionTip = false
// 注册为全局可用组件
Vue.component('tree-table', TreeTable)
// 全局时间(格式转换)过滤器dateFormat
Vue.filter('dateFormat', function (originVal) {
  const dt = new Date(originVal)
  const y = dt.getFullYear()
  // getmonth是从零开始的所有要加一padStart第一个参数是2位，第二个参数是不满两位补0
  const m = (dt.getMonth() + 1 + '').padStart(2, '0')
  const d = (dt.getDate() + '').padStart(2, '0')
  const hh = (dt.getHours() + '').padStart(2, '0')
  const mm = (dt.getMinutes() + '').padStart(2, '0')
  const ss = (dt.getSeconds() + '').padStart(2, '0')
  // ``为模版字符串
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
})
// 将富文本编辑器注册为全局可用组件
Vue.use(VueQuillEditor)

new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
