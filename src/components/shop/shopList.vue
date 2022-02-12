<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>店铺管理</el-breadcrumb-item>
      <el-breadcrumb-item>店铺列表</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-button type="primary" @click="addshop">添加店铺</el-button>
      <el-table :data="tableData" style="width: 100%">
        <el-table-column prop="name" label="店铺名"> </el-table-column>
        <el-table-column prop="address" label="店铺位置"> </el-table-column>
        <el-table-column label="操作">
          <template slot-scope="scope">
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              :disabled="scope.row.orderNumber == 0"
              @click="removeParams(scope.row.id)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      tableData: [],
    }
  },
  methods: {
    //添加店铺
    addshop() {
      this.$router.push('/shop/add')
    },
    //店铺初始化
    async getList() {  
      const { data: res } = await this.$http.get(
        `businesses/getShop`
      )
    this.tableData = res.result
    console.log(res)
      if (!res.isSucceed) {
        return this.$message.error('店铺查询失败')
      }
    },
    //店铺删除
    async removeParams(id) {
      const { data: res } = await this.$http.delete(
        `businesses/${id}`
      )
    if (!res.isSucceed) {
        return this.$message.error('店铺删除失败')
      }
      this.$message.success('店铺删除成功')
      this.getList()
    },
  },
  created() {
    this.getList()
  },
}
</script>

<style lang="less" scoped>
</style>