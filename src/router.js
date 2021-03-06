import Vue from 'vue'
import Router from 'vue-router'
// import Login from './components/Login.vue'
const Login = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Login.vue')
// import Home from './components/Home.vue'
const Home = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Home.vue')
// import Welcome from './components/Welcome.vue'
const Welcome = () => import(/* webpackChunkName: "login_home_welcome" */ './components/Welcome.vue')
// import users from './components/user/users.vue'
const users = () => import(/* webpackChunkName: "Users_Rights_Roles" */ './components/user/users.vue')
// import Cate from './components/goods/Cate.vue'
const Cate = () => import(/* webpackChunkName: "Cate_Params" */ './components/goods/Cate.vue')
// import params from './components/goods/params.vue'
const params = () => import(/* webpackChunkName: "Cate_Params" */ './components/goods/params.vue')
// import List from './components/goods/List.vue'
const List = () => import(/* webpackChunkName: "GoodsList_Add" */ './components/goods/List.vue')
// import Add from './components/goods/Add.vue'
const Add = () => import(/* webpackChunkName: "GoodsList_Add" */ './components/goods/Add.vue')
// import Order from './components/order/Order.vue'
const Order = () => import(/* webpackChunkName: "Order_Report" */ './components/order/Order.vue')
// import Report from './components/report/Report.vue'
const Report = () => import(/* webpackChunkName: "Order_Report" */ './components/report/Report.vue')
const ShopGoods = () => import( './components/goods/ShopAdd.vue')
const worker = () => import( './components/user/worker.vue')
const shopList = () => import( './components/shop/shopList.vue')
const addShop = () => import( './components/shop/addShop.vue')
const news = () => import( './components/new/new.vue')
Vue.use(Router)

const router = new Router({
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', component: Login },
    {
      path: '/home',
      component: Home,
      redirect: '/welcome',
      children: [
        { path: '/welcome', component: Welcome },
        { path: '/users', component: users },
        { path: '/categories', component: Cate },
        { path: '/params', component: params },
        { path: '/goods', component: List },
        { path: '/goods/add', component: Add },
        { path: '/orders', component: Order },
        { path: '/reports', component: Report },
        { path: '/shopGoods',component:ShopGoods},
        { path: '/worker',component:worker},
        { path: '/shop',component:shopList},
        { path: '/shop/add',component:addShop},
        { path: '/news',component:news}
      ]
    }
  ]
})

// ????????????????????????
router.beforeEach((to, from, next) => {
  // to ?????????????????????
  // from ?????????????????????????????????
  // next ??????????????????????????????
  //     next()  ??????    next('/login')  ????????????

  if (to.path === '/login') return next()
  // ??????token
  const tokenStr = window.sessionStorage.getItem('token')
  if (!tokenStr) return next('/login')
  next()
})

export default router
