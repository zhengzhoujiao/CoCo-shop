<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>财务统计</el-breadcrumb-item>
      <el-breadcrumb-item>财务统计</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-row style="margin-top:10px">
        <el-col :span="8"><div>当天收入: {{money.dailyIncome}}元</div></el-col>
        <el-col :span="8"><div>本月收入: {{money.monthIncome}}元</div></el-col>
        <el-col :span="8"><div>本年收入: {{money.yearIncome}}元</div></el-col>
      </el-row>
      <el-row style="margin-top:30px">
        <el-col :span="8">
          <el-input placeholder="请输入内容">
            <el-button slot="append" icon="el-icon-search"></el-button>
          </el-input>
        </el-col>
      </el-row>
      <!-- 订单列表数据 -->
      <el-table :data="orderlist" border stripe>
        <el-table-column align="center" type="index"></el-table-column>
        <el-table-column align="center" label="收入来源">订单</el-table-column>
        <el-table-column
          align="center"
          label="金额"
          prop="money"
        ></el-table-column>
        <el-table-column align="center" label="时间" prop="createTime">
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <el-pagination
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      //收入
      money:{
        dailyIncome:'',
        monthIncome:'',
        yearIncome:''
      },
      orderlist: [],
      // 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 5,
      },
      total: 0,
      //月收入
      mpriceSum: 0,
      //日收入
      dpriceSum: 0,
      //年收入
      ypriceSum: 0,
    }
  },
  created() {
    this.getList()
  },
  methods: {
    //收入信息获取
    async getList() {
      let res = await axios.get(`http://192.168.2.144:8001/api/border/${window.sessionStorage.getItem('bid')}`)
      // this.total = res.data.total
      this.orderlist = res.data.result
      let res2 = await axios.get(`http://192.168.2.144:8001/api/finance/${window.sessionStorage.getItem('bid')}`)
      // this.total = res.data.total
      this.money = res2.data.result
      console.log(res2)
      console.log(this.money)
    },
    // 页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
  },
}
</script>

<style lang="less" scoped>
</style>
