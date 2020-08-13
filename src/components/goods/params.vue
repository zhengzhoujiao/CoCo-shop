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
            :props="{value:'cat_id',label:'cat_name',children:'children'}"
            @change="handleChange"
          ></el-cascader>
        </el-col>
      </el-row>
      <!-- tab导航标签 v-model将激活页签的唯一name名称动态绑定到对应的值上tab-click点击任何页签都触发-->
      <el-tabs v-model="activeName" @tab-click="handleTabClick">
        <!-- 添加动态参数面板 -->
        <el-tab-pane label="动态参数" name="many">
          <!-- 选择三级分类才启用 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true
          "
          >添加参数</el-button>
          <!-- 动态表格 -->
          <el-table :data="manyTableDate" border stripe>
            <!-- expend展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 v-if="inputVisible"控制文本框和button的切换显示 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="参数名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-tab-pane>
        <!-- 添加静态属性面板 -->
        <el-tab-pane label="静态属性" name="only">
          <!-- 选择三级分类才启用 -->
          <el-button
            type="primary"
            size="mini"
            :disabled="isBtnDisabled"
            @click="addDialogVisible = true"
          >添加属性</el-button>
          <!-- 静态表格 -->
          <el-table :data="onlyTableDate" border stripe>
            <!-- expend展开行 -->
            <el-table-column type="expand">
              <template slot-scope="scope">
                <el-tag
                  v-for="(item, i) in scope.row.attr_vals"
                  :key="i"
                  closable
                  @close="handleClose(i,scope.row)"
                >{{item}}</el-tag>
                <!-- 输入文本框 v-if="inputVisible"控制文本框和button的切换显示 -->
                <el-input
                  class="input-new-tag"
                  v-if="scope.row.inputVisible"
                  v-model="scope.row.inputValue"
                  ref="saveTagInput"
                  size="small"
                  @keyup.enter.native="handleInputConfirm(scope.row)"
                  @blur="handleInputConfirm(scope.row)"
                ></el-input>
                <!-- 添加按钮 -->
                <el-button
                  v-else
                  class="button-new-tag"
                  size="small"
                  @click="showInput(scope.row)"
                >+ New Tag</el-button>
              </template>
            </el-table-column>
            <el-table-column type="index"></el-table-column>
            <el-table-column label="属性名称" prop="attr_name"></el-table-column>
            <el-table-column label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="showEditDialog(scope.row.attr_id)"
                >编辑</el-button>
                <el-button
                  type="danger"
                  icon="el-icon-delete"
                  size="mini"
                  @click="removeParams(scope.row.attr_id)"
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
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addParams">确 定</el-button>
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
        <el-form-item :label="titleText" prop="attr_name">
          <el-input v-model="editFrom.attr_name"></el-input>
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
      selectCateKeys: [],
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
        attr_name: ''
      },
      // 添加表单验证规则
      addFromRules: {
        attr_name: [
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
        attr_name: [
          { required: true, message: '请输入参数名称', trigger: 'blur' }
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
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败！')
      }
      this.cateList = res.data
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
      if (this.selectCateKeys.length !== 3) {
        this.selectCateKeys = []
        this.manyTableDate = []
        this.onlyTableDate = []
        return
      }
      console.log(this.selectCateKeys)
      // 根据所选分类id和当前所属面板获取数据 params指定get参数
      const { data: res } = await this.$http.get(
        `categories/${this.cateId}/attributes`,
        {
          params: {
            sel: this.activeName
          }
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数失败！')
      }
      console.log(res.data)
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        // 控制文本框显示与隐藏
        item.inputVisible = false
        // 文本框的输入值
        item.inputValue = ''
      })
      console.log(res.data.attr_vals)
      if (this.activeName === 'many') {
        this.manyTableDate = res.data
      } else {
        this.onlyTableDate = res.data
      }
    },
    // 监听对话框关闭事件刷新验证
    addDialogClose() {
      this.$refs.addFromRef.resetFields()
    },
    // 点击按钮,添加参数
    addParams() {
      this.$refs.addFromRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.post(
          `categories/${this.cateId}/attributes`,
          {
            attr_name: this.addFrom.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加参数失败！')
        }
        this.$message.success('添加参数成功')
        this.addDialogVisible = false
        this.getCateList()
      })
    },
    // 点击按钮展示修改对话框
    async showEditDialog(attrid) {
      const {
        data: res
      } = await this.$http.get(
        `categories/${this.cateId}/attributes/${attrid}`,
        { params: { attr_sel: this.activeName } }
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('获取参数信息失败！')
      }
      this.editFrom = res.data
      this.editDialogVisible = true
    },
    // 监听修改对话框关闭重置表单
    editDialogClose() {
      this.$refs.editFromRef.resetFields()
    },
    // 点击按钮修改参数
    editParams() {
      this.$refs.editFromRef.validate(async valid => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(
          `categories/${this.cateId}/attributes/${this.editFrom.attr_id}`,
          {
            attr_name: this.editFrom.attr_name,
            attr_sel: this.activeName
          }
        )
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败')
        }
        this.$message.success('修改成功')
        this.getnum()
        this.editDialogVisible = false
      })
    },
    // 删除参数
    async removeParams(attrid) {
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
      const { data: res } = await this.$http.delete(
        `categories/${this.cateId}/attributes/${attrid}`
      )
      console.log(res)
      if (res.meta.status !== 200) {
        return this.$message.error('删除参数失败！')
      }
      this.$message.success('删除参数成功！')
      this.getnum()
    },
    // 文本框失去焦点或按下enter都会触发 trim()去除字符串两端空格
    async handleInputConfirm(row) {
      // 如果输入内容是空格则刷新
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      // 将新增数据压入attr_vals数组
      row.attr_vals.push(row.inputValue.trim())
      // 将修改过的数组同步更新到数据库  join拼接 将数组转成字符串
      this.saveAttrVals(row)
    },
    // 将对attr_vals的操作保存到数据库
    async saveAttrVals(row) {
      const { data: res } = await this.$http.put(
        `categories/${this.cateId}/attributes/${row.attr_id}`,
        {
          attr_name: row.attr_name,
          attr_sel: row.attr_sel,
          attr_vals: row.attr_vals.join(' ')
        }
      )
      if (res.meta.status !== 200) {
        return this.$message.error('添加参数失败')
      }
      this.$message.success('修改参数成功')
    },
    // 控制按钮和文本框的切换
    showInput(row) {
      row.inputVisible = true
      // 让文本框自动获得焦点
      // nextTick方法作用当页面上元素被重新渲染后(不然就没有此元素也无法获取焦点)才会指定调回函数中的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus()
      })
    },
    // tag删除
    handleClose(i, row) {
      // splice是在原数据上修改 删除此数组索引i的一个数据
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  // 计算属性
  computed: {
    // 如果按钮需要被禁用,则返回true,否则返回false
    isBtnDisabled() {
      if (this.selectCateKeys.length !== 3) {
        return true
      }
      return false
    },
    // 当前选中的三级分类的id
    cateId() {
      if (this.selectCateKeys.length === 3) {
        return this.selectCateKeys[2]
      }
      return null
    },
    // 动态计算标题文本
    titleText() {
      if (this.activeName === 'many') {
        return '动态参数'
      }
      return '静态属性'
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
