<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card>
      <el-tabs v-model="activeName" @tab-click="handleClick">
        <el-tab-pane label="制作中订单" name="first">
          <el-row>
            <el-col :span="8">
              <el-input placeholder="请输入内容">
                <el-button slot="append" icon="el-icon-search"></el-button>
              </el-input>
            </el-col>
          </el-row>
          <!-- 订单列表数据 -->
          <el-table :data="orderlist" border stripe>
            <el-table-column align="center" type="index"></el-table-column>
            <el-table-column
              align="center"
              label="订单编号"
              prop="orderNumber"
            ></el-table-column>
            <el-table-column
              align="center"
              label="订单价格"
              prop="money"
            ></el-table-column>
            <el-table-column align="center" label="订单状态">
              <template>
                <el-tag type="success">制作中</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="取单时间"
              prop="appointTime"
            ></el-table-column>
            <el-table-column align="center" label="下单时间" prop="createTime">
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template slot-scope="scope">
                <div>
                  <el-button
                    type="primary"
                    icon="el-icon-search
"
                    size="mini"
                    @click="look(scope.row)"
                  ></el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="del(scope.row)"
                  ></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination
        ></el-tab-pane>
        <el-tab-pane label="待取订单" name="second">
          <el-row>
            <el-col :span="8">
              <el-input placeholder="请输入内容">
                <el-button slot="append" icon="el-icon-search"></el-button>
              </el-input>
            </el-col>
          </el-row>
          <!-- 订单列表数据 -->
          <el-table :data="orderlist2" border stripe>
            <el-table-column align="center" type="index"></el-table-column>
            <el-table-column
              align="center"
              label="订单编号"
              prop="orderNumber"
            ></el-table-column>
            <el-table-column
              align="center"
              label="订单价格"
              prop="money"
            ></el-table-column>
            <el-table-column align="center" label="订单状态">
              <template>
                <el-tag type="warning">待取</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="取单时间"
              prop="appointTime"
            ></el-table-column>
            <el-table-column align="center" label="下单时间" prop="createTime">
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template slot-scope="scope">
                <div>
                  <el-button
                    type="primary"
                    icon="el-icon-search
"
                    size="mini"
                    @click="look2(scope.row)"
                  ></el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="del(scope.row)"
                  ></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination
        ></el-tab-pane>
        <el-tab-pane label="历史订单" name="third">
          <el-row>
            <el-col :span="8">
              <el-input placeholder="请输入内容">
                <el-button slot="append" icon="el-icon-search"></el-button>
              </el-input>
            </el-col>
          </el-row>
          <!-- 订单列表数据 -->
          <el-table :data="orderlist3" border stripe>
            <el-table-column align="center" type="index"></el-table-column>
            <el-table-column
              align="center"
              label="订单编号"
              prop="orderNumber"
            ></el-table-column>
            <el-table-column
              align="center"
              label="订单价格"
              prop="money"
            ></el-table-column>
            <el-table-column align="center" label="订单状态">
              <template>
                <el-tag type="primary">已完成</el-tag>
              </template>
            </el-table-column>
            <el-table-column
              align="center"
              label="取单时间"
              prop="appointTime"
            ></el-table-column>
            <el-table-column align="center" label="下单时间" prop="createTime">
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template slot-scope="scope">
                <div>
                  <el-button
                    type="primary"
                    icon="el-icon-search
"
                    size="mini"
                    @click="look3(scope.row)"
                  ></el-button>
                  <el-button
                    type="danger"
                    icon="el-icon-delete"
                    size="mini"
                    @click="del(scope.row)"
                  ></el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <!-- 分页 -->
          <el-pagination
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
            :current-page="queryInfo.pagenum"
            :page-sizes="[5, 10, 15, 20]"
            :page-size="queryInfo.pagesize"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
          ></el-pagination
        ></el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 制作中订单对话框 -->
    <el-dialog
      title="订单详情"
      :visible.sync="orderDialogVisible"
      width="50%"
    >
      <div class="orderdetial" v-bind="theOrder">
        <span style="font-size: 18px">{{theOrder.bName}}</span>
        <span>地址:{{theOrder.address}}</span>
        <span>订单号:{{theOrder.orderNumber}}</span>
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column align="center" prop="mName" label="奶茶名" width="150"> </el-table-column>
          <el-table-column align="center" prop="selectAttr" label="奶茶属性" width="150"> </el-table-column>
          <el-table-column align="center" prop="number" label="数目"> </el-table-column>
          <el-table-column align="center" prop="payMoney" label="单价"> </el-table-column>
          <el-table-column align="center" label="总价">
            <template slot-scope="scope">
              <div>
                {{scope.row.payMoney*scope.row.number}}
              </div>
            </template>
          </el-table-column>
        </el-table>
        <span>总价:{{theOrder.money}}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="success" @click="makeEnd">制作完毕</el-button>
      </span>
    </el-dialog>
    <!-- 待取订单对话框 -->
    <el-dialog title="订单详情" :visible.sync="orderDialogVisible2" width="50%">
      <div class="orderdetial" v-bind="theOrder">
        <span style="font-size: 18px">{{theOrder.bName}}</span>
        <span>地址:{{theOrder.address}}</span>
        <span>订单号:{{theOrder.orderNumber}}</span>
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column align="center" prop="mName" label="奶茶名" width="150"> </el-table-column>
          <el-table-column align="center" prop="selectAttr" label="奶茶属性" width="150"> </el-table-column>
          <el-table-column align="center" prop="number" label="数目"> </el-table-column>
          <el-table-column align="center" prop="payMoney" label="单价"> </el-table-column>
          <el-table-column align="center" label="总价">
            <template slot-scope="scope">
              <div>
                {{scope.row.payMoney*scope.row.number}}
              </div>
            </template>
          </el-table-column>
        </el-table>
        <span>总价:{{theOrder.money}}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="primary" @click="finish">订单完成</el-button>
      </span>
    </el-dialog>
    <!-- 已完成订单对话框 -->
    <el-dialog title="订单详情" :visible.sync="orderDialogVisible3" width="50%">
      <div class="orderdetial">
        <span style="font-size: 18px">{{theOrder.bName}}</span>
        <span>地址:{{theOrder.address}}</span>
        <span>订单号:{{theOrder.orderNumber}}</span>
        <el-table :data="tableData" stripe style="width: 100%">
          <el-table-column align="center" prop="mName" label="奶茶名" width="150"> </el-table-column>
          <el-table-column align="center" prop="selectAttr" label="奶茶属性" width="150"> </el-table-column>
          <el-table-column align="center" prop="number" label="数目"> </el-table-column>
          <el-table-column align="center" prop="payMoney" label="单价"> </el-table-column>
          <el-table-column align="center" label="总价">
            <template slot-scope="scope">
              <div>
                {{scope.row.payMoney*scope.row.number}}
              </div>
            </template>
          </el-table-column>
        </el-table>
        <span>总价:{{theOrder.money}}</span>
      </div>
      <span slot="footer" class="dialog-footer">
        <el-button type="info" @click="orderDialogVisible3 = false"
          >取消</el-button
        >
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  data() {
    return {
      // 查询条件
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      tableData:[],
      total: 0,
      orderlist: [],
      orderlist2: [],
      orderlist3: [],
      //   控制对话框显示与隐藏
      orderDialogVisible: false,
      orderDialogVisible2: false,
      orderDialogVisible3: false,
      activeName: 'first',
      //当前点击订单
      theOrder: {},
    }
  },
  created() {
    this.getOrderList()
  },
  methods: {
    //   获取订单列表
    async getOrderList() {
      // const { data: res } = await this.$http.get('orders', {
      //   params: this.queryInfo,
      // })

      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取订单列表失败！')
      // }

      // console.log(res)
      // this.total = res.data.total
      let res = await axios.get(`http://192.168.2.144:8001/api/border/${window.sessionStorage.getItem('bid')}/?orderStatus=1`)
      let res2 = await axios.get(`http://192.168.2.144:8001/api/border/${window.sessionStorage.getItem('bid')}/?orderStatus=2`)
      let res3 = await axios.get(`http://192.168.2.144:8001/api/border/${window.sessionStorage.getItem('bid')}/?orderStatus=3`)
      this.orderlist = res.data.result
      this.orderlist2 = res2.data.result
      this.orderlist3 = res3.data.result
    },
    //制作完成
    async makeEnd() {
      let res = await axios.put(`http://192.168.2.144:8001/api/border/${this.theOrder.id}`,{orderStatus:2})
      this.$message.success('制作完成!')
      this.getOrderList()
      this.orderDialogVisible = false
      //通过this.theOrder请求接口改状态
    },
    //订单完成
    async finish() {
      let res = await axios.put(`http://192.168.2.144:8001/api/border/${this.theOrder.id}`,{orderStatus:3})
      this.$message.success('订单完成!')
      this.getOrderList()
      this.orderDialogVisible2 = false
      //通过this.theOrder请求接口改状态
    },
    // 分页大小改变
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getOrderList()
    },
    // 页码改变
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getOrderList()
    },
    //订单详情
    async look(item) {
      var that = this
      this.orderDialogVisible = true
      this.theOrder = item
      let res =  await axios.get(`http://192.168.2.144:8001/api/orderdetail/${that.theOrder.id}`)
      this.tableData = res.data.result
    },
    async look2(item) {
      var that = this
      this.orderDialogVisible2 = true
      this.theOrder = item
      let res =  await axios.get(`http://192.168.2.144:8001/api/orderdetail/${that.theOrder.id}`)
      this.tableData = res.data.result
    },
    async look3(item) {
      var that = this
      this.orderDialogVisible3 = true
      this.theOrder = item
      let res =  await axios.get(`http://192.168.2.144:8001/api/orderdetail/${that.theOrder.id}`)
      this.tableData = res.data.result
    },
    async del(item){
      let res =  await axios.delete(`http://192.168.2.144:8001/api/border/${item.id}`)
      if(res.data.isSucceed){
        this.getOrderList()
        return this.$message.success('删除成功！')
      }
      this.$message.success('删除失败！')
    },
    //tab切换
    handleClick(tab, event) {
      console.log(tab, event)
    },
  },
}
</script>

<style lang="less" scoped>
.orderdetial {
  span {
    display: block;
    margin-top: 10px;
  }
}
</style>
