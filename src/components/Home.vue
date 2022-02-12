<template>
  <div class="home-container">
    <el-container class="home-container">
      <!-- 头部 -->
      <el-header>
        <div>
          <img class="headerImg" src="../assets/zxc.jpg" alt />
          <span>{{this.$store.getters.getTheName}}管理平台</span>
        </div>
        <el-button type="info" @click="logout">退出</el-button>
      </el-header>
      <!-- 侧边栏 -->
      <el-container>
        <el-aside :width="isCollapse ? '64px' : '200px'">
          <div class="toggle-button" @click="toggleCollapse">|||</div>
          <!-- 侧边栏菜单区域 -->
          <el-menu background-color="#333744" text-color="#fff" active-text-color="#409EFF" unique-opened :collapse="isCollapse" :collapse-transition="false" :router="true" :default-active="activePath">
            <!-- index不能相同否则行为相同 -->
            <el-submenu :index="'/' + item.path" v-for="item in menulist" :key="item.id">
              <template slot="title">
                <i :class="iconsObj[item.id]"></i>
                <span>{{item.authName}}</span>
              </template>
              <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id" @click="saveNavState('/' + subItem.path)">
                <template slot="title"><i class="el-icon-menu"></i><span>{{subItem.authName}}</span></template>
              </el-menu-item>
            </el-submenu>
          </el-menu>
        </el-aside>
        <!-- 右侧内容主体 -->
        <el-main>
          <router-view></router-view>
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>

<script>
export default {
  data() {
    return {
      menulist: [],
      iconsObj: {
        '125': 'iconfont icon-user',
        '103': 'iconfont icon-tijikongjian',
        '101': 'iconfont icon-shangpin',
        '102': 'iconfont icon-danju',
        '145': 'iconfont icon-baobiao'
      },
      isCollapse: false,
      // 被激活的链接地址
      activePath: ''
    }
  },
  created() {
    this.getMenuList()
    // this.activePath = window.sessionStorage.getItem('activePath')
  },
  methods: {
    logout() {
      window.sessionStorage.clear()
      this.$router.push('/login')
    },
    // 获取所有菜单
    async getMenuList() {
      const {data:res} = await this.$http.get('page?rid='+ window.sessionStorage.getItem('Rid'))
      this.menulist=res.result
    },
    // 点击按钮，切换菜单折叠
    toggleCollapse() {
      this.isCollapse = !this.isCollapse
    },
    // 点击二级菜单高亮
    saveNavState(activePath) {
      window.sessionStorage.setItem('activePath', activePath)
      this.activePath = activePath
    }
  }
}
</script>

<style lang="less" scoped>
.home-container {
  height: 100%;
}
.headerImg{
  width: 60px;
  height: 60px;
}
.el-header {
  background-color: #373d41;
  display: flex;
  justify-content: space-between;
  padding-left: 0;
  align-items: center;
  color: white;
  font-size: 20px;
  > div {
    display: flex;
    align-items: center;
    span {
      margin-left: 15px;
    }
  }
}

.el-aside {
  background-color: #333744;
  .el-menu{
    border-right: none;
  }
}

.el-main {
  background-color: #eaedf1;
}

.iconfont{
  margin-right: 10px;
}

.toggle-button{
  background-color: #4A5064;
  font-size: 10px;
  text-align: center;
  line-height: 25px;
  color: #fff;
  letter-spacing: 0.2em;
  cursor: pointer;
}
</style>
