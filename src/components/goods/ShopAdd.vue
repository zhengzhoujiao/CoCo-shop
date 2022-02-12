<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-row>
      <!-- 卡片视图区域 :gutter列间距-->
      <el-col :span="11">
        <!-- 左侧未有种类 -->
        <el-card>
          <el-row :gutter="20">
            <el-col :span="8">
              <div style="margin-bottom: 20px">全部奶茶类别</div>
              <el-input
                placeholder="请输入内容"
                v-model="queryInfo.query"
                clearable
                @clear="getGoodsList"
              >
                <el-button
                  slot="append"
                  icon="el-icon-search"
                  @click="getGoodsList"
                ></el-button>
              </el-input>
            </el-col>
          </el-row>
          <!-- table表格区 -->
          <el-table
            :data="pageList"
            border
            stripe
            center
            ref="multipleTable"
            @selection-change="handleSelectionChange"
          >
            <el-table-column align="center" type="selection" width="80">
            </el-table-column>
            <el-table-column
              align="center"
              type="index"
              width="80"
            ></el-table-column>
            <el-table-column
              align="center"
              label="奶茶名称"
              prop="name"
              width="160"
            ></el-table-column>
            <el-table-column
              align="center"
              label="奶茶价格(元)"
              prop="price"
              width="120px"
            ></el-table-column>
            <el-table-column
              align="center"
              label="分类"
              prop="categoryName"
              width="120px"
            ></el-table-column>
            <el-table-column
              align="center"
              label="图片"
              prop="imageUrl"
              width="157px"
            >
              <template slot-scope="scope">
                <!-- 调用过滤器改变时间格式 -->
                <img :src="scope.row.imageUrl" style="width: 50px" alt="" />
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页区域 current-page当前第几页-->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[10]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            background
          ></el-pagination>
        </el-card>
      </el-col>
      <el-col :span="2" class="addBtn"
        ><el-button type="primary" @click="addCap">》》》</el-button></el-col
      >
      <el-col :span="11">
        <!-- 右侧已有种类 -->
        <el-card>
          <el-row :gutter="20">
            <el-col :span="24">
              <div style="margin-bottom: 20px">在售奶茶</div>
              <el-row>
                <el-col :span="8"
                  ><el-input
                    placeholder="请输入内容"
                    v-model="queryInfo2.query"
                    clearable
                    @clear="getShopGoodsList"
                  >
                    <el-button
                      slot="append"
                      icon="el-icon-search"
                      @click="getShopGoodsList"
                    ></el-button> </el-input
                ></el-col>
                <el-col :span="12">
                  <div>&nbsp;</div>
                </el-col>
              </el-row>
            </el-col>
          </el-row>
          <!-- table表格区 -->
          <el-table :data="pageList2" border stripe>
            <el-table-column align="center" type="index"></el-table-column>
            <el-table-column
              align="center"
              label="奶茶名称"
              prop="name"
              width="155"
            ></el-table-column>
            <el-table-column
              align="center"
              label="奶茶价格(元)"
              prop="price"
              width="100"
            ></el-table-column>
            <el-table-column
              align="center"
              label="分类"
              prop="categoryName"
              width="100"
            ></el-table-column>
            <el-table-column
              align="center"
              label="图片"
              prop="imageUrl"
              width="180px"
            >
              <template slot-scope="scope">
                <!-- 调用过滤器改变时间格式 -->
                <img :src="scope.row.imageUrl" style="width: 50px" alt="" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作" width="130px">
              <template slot-scope="scope">
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeById(scope.row.id)"
                ></el-button>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页区域 current-page当前第几页-->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange2"
            :current-page="queryInfo2.pagenum"
            :page-sizes="[10]"
            :page-size="queryInfo2.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total2"
            background
          ></el-pagination>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      queryInfo2: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      //当前店铺未上架奶茶
      goodslist: [],
      //当前店铺上架奶茶
      shopGoodlist: [],
      //未上架奶茶总数据条数
      total: 0,
      //已上架奶茶总条数
      total2: 0,
      multipleSelection: [],
      //当前页展示的未有奶茶
      pageList: [],
      //当前页展示的已有奶茶
      pageList2: [],
    }
  },
  async created() {
    await this.getShopGoodsList()
    this.getGoodsList()
  },
  methods: {
    handleSelectionChange(val) {
      this.multipleSelection = val
    },
    //根据分页获取对应的奶茶列表(和已有奶茶求补集)
    async getGoodsList() {
      //   const { data: res } = await this.$http.get('goods', {
      //     params: this.queryInfo,
      //   })
      //   if (res.meta.status !== 200) {
      //     return this.$message.error('查询商品列表失败！')
      //   }
      //   this.$message.success('查询商品列表成功！')
      const { data: res } = await axios.get(
        'http://localhost:5000/api/milktea/',{params:{keyword:this.queryInfo.query}}
      )
      this.goodslist = this.getDifferenceSetB(
        res.result,
        this.shopGoodlist,
        'id'
      )
      console.log(res)
      //总数
      this.total = this.goodslist.length
      //初始化第一页数据
      this.pageList = this.goodslist.slice(0, 10)
    },
    async getGoodsList2(){

    },
    //求数组差集
    getDifferenceSetB(arr1, arr2, typeName) {
      return Object.values(
        arr1.concat(arr2).reduce((acc, cur) => {
          if (
            acc[cur[typeName]] &&
            acc[cur[typeName]][typeName] === cur[typeName]
          ) {
            delete acc[cur[typeName]]
          } else {
            acc[cur[typeName]] = cur
          }
          return acc
        }, {})
      )
    },
    //根据分页获取对应的店铺上架奶茶列表
    async getShopGoodsList() {
      //   const { data: res } = await this.$http.get('goods', {
      //     params: this.queryInfo,
      //   })
      //   if (res.meta.status !== 200) {
      //     return this.$message.error('查询商品列表失败！')
      //   }
      //   this.$message.success('查询商品列表成功！')
      const { data: res } = await axios.get(
        'http://localhost:5000/api/salingmilktea/?Bid='+window.sessionStorage.getItem('bid')+'&Keyword='+this.queryInfo2.query
      )
      console.log(res)
      let caplist = []
      caplist = res.result
      this.shopGoodlist = caplist
      this.total2 = this.shopGoodlist.length
      this.pageList2 = this.shopGoodlist.slice(0, 10)
    },
    //添加新奶茶
    async addCap() {
      console.log(this.multipleSelection)
      //更新店铺已有奶茶
      this.shopGoodlist.push(...this.multipleSelection)
      //更新店铺未有奶茶
      this.goodslist = this.getDifferenceSetB(
        this.goodslist,
        this.multipleSelection,
        'id'
      )
      this.total=this.goodslist.length
      this.total2=this.shopGoodlist.length
      console.log(this.queryInfo.pagenum)
      this.pageList = this.goodslist.slice((this.queryInfo.pagenum - 1) * 10,
        this.queryInfo.pagenum * 10)
      this.pageList2 = this.shopGoodlist.slice((this.queryInfo2.pagenum - 1) * 10,
        this.queryInfo2.pagenum * 10)
      //上新奶茶id
      let caridList=[]
      this.multipleSelection.forEach(item=>{
        caridList.push(item.id)
      })
      const { data: res } = await this.$http.post(`salingmilktea/`,{bid:window.sessionStorage.getItem('bid'),mids:caridList})
      if (!res.isSucceed) {
        return this.$message.error('添加失败')
      }
      this.$message.success('添加成功')
    },
    //未上架奶茶获取当前页数据
    getPageList() {
      this.pageList = this.goodslist.slice(
        (this.queryInfo.pagenum - 1) * 10,
        this.queryInfo.pagenum * 10
      )
    },
    //已经上架奶茶当前页数据
    getPageList2() {
      this.pageList2 = this.shopGoodlist.slice(
        (this.queryInfo2.pagenum - 1) * 10,
        this.queryInfo2.pagenum * 10
      )
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      // this.getPageList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getPageList()
    },
    handleCurrentChange2(newPage) {
      this.queryInfo2.pagenum = newPage
      this.getPageList2()
    },
    // 删除商品
    async removeById(goodsid) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该商品, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除！')
      }
      const { data: res } = await this.$http.delete(`salingmilktea/`,{data:{bid:parseFloat(window.sessionStorage.getItem('bid')),mid:goodsid}})
      if (!res.isSucceed) {
        return this.$message.error('删除失败')
      }
      await this.getShopGoodsList()
      this.getGoodsList()
      this.$message.success('删除成功')
    },
    // 跳转到添加页面
    goAddpage() {
      this.$router.push('/goods/add')
    },
  },
}
</script>

<style lang="less" scoped>
.addBtn {
  margin-top: 400px;
  padding: 28px;
}
</style>
