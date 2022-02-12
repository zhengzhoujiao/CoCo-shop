<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>参数列表</el-breadcrumb-item>
    </el-breadcrumb>

    <!-- 卡片视图区 -->
    <el-card>
      <!-- 头部警告区域 -->
      <el-alert show-icon :closable="false" title="注意:只允许给第三级分类设置相关参数!" type="warning"></el-alert>
      <!-- 选择商品分类区 -->
      <el-row class="cat_out">
        <el-col>
          <span>商品类别分类：</span>
          <!-- 级联选择器 -->
          <el-cascader
            v-model="selectCateKeys"
            :options="cateList"
            expand-trigger="hover"
            :props="{value:'id',label:'AttrCategory'}"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab导航标签 v-model将激活页签的唯一name名称动态绑定到对应的值上tab-click点击任何页签都触发-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="属性" name="many">
          <!-- 动态表格 -->
          <el-table :data="cateList" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="AttrCategory"></el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="属性详情" name="only">
          <!-- 选择分类才启用 -->
          <el-button
            type="primary"
            size="mini"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态表格 -->
          <el-table :data="onlyTableDate" border stripe>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="name"></el-table-column>
            <el-table-column label="属性价钱" prop="price"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  :disabled="scope.row.orderNumber==0"
                  @click="showEditDialog(scope.row)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  :disabled="scope.row.orderNumber==0"
                  @click="removeParams(scope.row.id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
      </el-tabs>
    </el-card>
    <!-- 添加参数对话框（公用） -->
    <el-dialog
      @close="addDialogClose"
      :title="'添加' + titleText"
      :visible.sync="addDialogVisible"
      width="30%"
    >
      <el-form :model="addFrom" :rules="addFromRules" ref="addFromRef" label-width="100px">
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="addFrom.attr_name"></el-input>
        </el-form-item>
        <el-form-item label="属性价格" prop="attr_price">
          <el-input v-model="addFrom.attr_price"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addAttr">确 定</el-button>
      </span>
      <!-- 修改信息对话框 -->
    </el-dialog>
    <!-- 同时修改多个属性名ctrl加d -->
    <el-dialog
      @close="editDialogClose"
      :title="'修改' + titleText"
      :visible.sync="editDialogVisible"
      width="30%"
    >
      <el-form :model="editFrom" :rules="editFromRules" ref="editFromRef" label-width="100px">
        <el-form-item :label="titleText" prop="name">
          <el-input v-model="editFrom.name"></el-input>
        </el-form-item>
        <el-form-item label="属性价格" prop="price">
          <el-input v-model="editFrom.price"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editParams">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      //   商品分类列表
      cateList: [],
      //   级联选择框双向绑定的数组
      selectCateKeys: [-1,0,1],
      //   被激活页签名称
      activeName: 'many',
      // 动态表格数据
      manyTableDate: [],
      // 静态表格数据
      onlyTableDate: [],
      // 控制添加对话框显示隐藏
      addDialogVisible: false,
      // 添加参数表单数据
      addFrom: {
        attr_name: '',
        attr_price:''
      },
      // 添加表单验证规则
      addFromRules: {
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ],
        attr_price: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ]
      },
      // 修改对话框的显示与隐藏
      editDialogVisible: false,
      // 修改的表单数据对象
      editFrom: {
        attr_name: ''
      },
      // 修改表单的验证对象
      editFromRules: {
        name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
        ],
        price: [
          { required: true, message: '请输入参数价格', trigger: 'blur' }
        ]
      }
      // // 控制按钮和文本框切换
      // inputVisible: false,
      // // 文本框输入内容
      // inputValue: '' 为每一个数组对象单独追加属性 在下面getnum函数中
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取所有商品分类列表
    async getCateList() {
      // const { data: res } = await this.$http.get('categories')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取商品分类失败！')
      // }
      this.cateList = [{AttrCategory:'加料',id:-1}
        ,{AttrCategory:'温度',id:0}
        ,{AttrCategory:'糖度',id:1}]
    },
    //添加属性
    async addAttr(){
      console.log(this.addFrom.attr_name)
      console.log(this.addFrom.attr_price)
      const { data: res } = await this.$http.post(`attributes/`,{AttrCategory:this.selectCateKeys[0],Name:this.addFrom.attr_name,Price:parseFloat(this.addFrom.attr_price)})
      if (!res.isSucceed) {
        return this.$message.error('查找属性失败')
      }
      this.$message.success('查找属性成功')
      this.onlyTableDate = res.result
      console.log(this.onlyTableDate)
      this.getnum()
    },
    // 级联选择框选择变化触发函数
    handleChange() {
      this.getnum()
    },
    // 这是tab页签点击事件处理函数
    handleTabClick() {
      this.getnum()
    },
    // 获取数值数组给动态，静态表格
    async getnum() {

      console.log(this.selectCateKeys)
      // 根据所选分类id和当前所属面板获取数据 params指定get参数
      const { data: res } = await this.$http.get(`attributes/?attrCategory=${this.selectCateKeys[0]}
`)
      if (!res.isSucceed) {
        return this.$message.error('查找属性失败')
      }
      this.$message.success('查找属性成功')
      this.onlyTableDate = res.result
      console.log(this.onlyTableDate)
    },
    // 监听对话框关闭事件刷新验证
    addDialogClose() {
      this.$refs.addFromRef.resetFields()
    },
    // 点击按钮展示修改对话框
    async showEditDialog(attr) {
      console.log(attr)
      this.editFrom = attr
      this.editDialogVisible = true
    },
    // 监听修改对话框关闭重置表单
    editDialogClose() {
      this.$refs.editFromRef.resetFields()
    },
    // 点击按钮修改参数
    async editParams() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(`attributes/`,{AttrCategory:this.selectCateKeys[0],Name:this.editFrom.name,Price:parseFloat(this.editFrom.price)})
        console.log(res)
      if (!res.isSucceed) {
        return this.$message.error('修改属性失败')
      }
        this.$message.success('修改属性成功')
        this.getnum()
        this.editDialogVisible = false
      })
    },
    // 删除参数
    async removeParams(id) {
      const confirmResult = await this.$confirm(
        '此操作将永久删除该参数, 是否继续?',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('已取消删除')
      }
      const { data: res } = await this.$http.delete(`attributes/${id}`)
      if (!res.isSucceed) {
        return this.$message.error('删除属性失败')
      }
      this.$message.success('删除属性成功')
      this.getnum()
    },
  },
  // 计算属性
  computed: {
    // 如果按钮需要被禁用,则返回true,否则返回false
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 1) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectCateKeys.length === 1) {
        return this.selectCateKeys[0]
      }
      return null
    },
    // 动态计算标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '属性'
      }
      return '属性详情'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_out {
  margin: 15px, 0;
}

.el-alert {
  margin-bottom: 15px;
}

.el-tag {
  margin: 10px;
}

.input-new-tag {
  width: 120px;
}
</style>
