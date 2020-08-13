<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="3">
          <el-button type="primary" @click="showAddCateDialog">添加分类</el-button>
        </el-col>
      </el-row>
      <!-- vue-table-with-tree组件 -->
      <tree-table
        class="tree-table"
        :data="catelist"
        :columns="columns"
        :selection-type="false"
        :expand-type="false"
        show-index
        index-text="#"
        border
      >
        <!-- 是否有效 -->
        <template slot="isok" slot-scope="scope">
          <i
            class="el-icon-success"
            v-if="scope.row.cat_deleted === false"
            style="color: lightgreen"
          ></i>
          <i class="el-icon-error" v-else style="color: red"></i>
        </template>
        <!-- 排序 -->
        <template slot="order" slot-scope="scope">
          <el-tag size="mini" v-if="scope.row.cat_level === 0">一级</el-tag>
          <el-tag size="mini" type="success" v-else-if="scope.row.cat_level === 1">二级</el-tag>
          <el-tag size="mini" type="warning" v-else>三级</el-tag>
        </template>
        <!-- 操作 -->
        <template slot="opt" slot-scope="scope">
          <el-button
            type="primary"
            icon="el-icon-edit"
            size="mini"
            @click="edit(scope.row.cat_id)"
          >编辑</el-button>
          <el-button
            type="danger"
            icon="el-icon-delete"
            size="mini"
            @click="del(scope.row.cat_id)"
          >删除</el-button>
        </template>
      </tree-table>
      <!--页码 size-change监听页大小改变将值传到服务器刷新表格 current-change监听页码改变将值传到服务器刷新表格 current-page当前渲染页 page-size当前每页大小 -->
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        :current-page="querInfo.pagenum"
        :page-sizes="[3, 5, 8, 11]"
        :page-size="querInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
      ></el-pagination>
    </el-card>
    <!-- 添加分类的对话框 -->
    <el-dialog
      title="添加分类"
      :visible.sync="addCateDialogVisible"
      width="50%"
      @close="addCateDialogClosed"
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        :rules="addCateFormRules"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="addCateForm.cat_name"></el-input>
        </el-form-item>
        <el-form-item label="父级分类">
          <!-- Cascader 级联选择器options数据源 -->
          <!-- props用来指定配置对象 -->
          <!-- v-model将选择的值双向绑定到date中 传到数据库 数组 -->
          <!-- 级联选择器发生变化就触发change事件 -->
          <el-cascader
            :options="parentCateList"
            :props="{value:'cat_id',label:'cat_name',children:'children'}"
            v-model="selectedKeys"
            @change="parentCateChanged"
            clearable
            change-on-select
            expand-trigger="hover"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <el-dialog :visible.sync="editCateDialogVisible" width="50%" @close="editCateDialogClosed">
      <el-form
        :model="editCateForm"
        :rules="editCateFormRules"
        ref="editCateFormRef"
        label-width="100px"
      >
      <!-- prop命名必须是当前input双向绑定的数据源的属性名 并不是监听输入框 而是判断数据源属性是否符合规则 -->
        <el-form-item label="类别名" prop="cat_name">
          <el-input v-model="editCateForm.cat_name"></el-input>
        </el-form-item>
        <el-button type="primary" @click="editover">确定</el-button>
        <el-button type="danger" @click="editCateDialogVisible = false">取消</el-button>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5
      },
      // 商品分类数据列表
      catelist: [],
      //   总数据数
      total: 0,
      //   给table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name'
        },
        {
          label: '是否有效',
          type: 'template',
          //   表示当前这一列使用模版名称
          template: 'isok'
        },
        {
          label: '排序',
          type: 'template',
          //   表示当前这一列使用模版名称
          template: 'order'
        },
        {
          label: '操作',
          type: 'template',
          //   表示当前这一列使用模版名称
          template: 'opt'
        }
      ],
      //   控制添加分类对话框显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        // 将要添加分类名
        cat_name: '',
        // 父级分类的Id
        cat_pid: 0,
        // 分类等级默认1级
        cat_level: 0
      },
      // 添加分类的表单校验规则
      addCateFormRules: {
        cat_name: [
          { required: true, message: '请输入分类名称', trigger: 'blur' }
        ]
      },
      //   父级分类的列表
      parentCateList: [],
      //   指定级联选择器的配置对象 value具体选中的属性 laber你所看到的属性 children父子嵌套的属性
      cascaderProps: {
        value: 'cat_id',
        laber: 'cat_name',
        children: 'children'
      },
      //   选中的父级分类的Id数组
      selectedKeys: [],
      // 控制修改对话框显示与隐藏
      editCateDialogVisible: false,
      // 修改的数据
      editCateForm: {},
      // 修改验证规则
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入修改后的类别名', trigger: 'blur' }
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类数据
    async getCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: this.querInfo
      })
      if (res.meta.status !== 200) {
        return this.$message.error('获取商品分类失败!')
      }
      //   将获取到的数据存到catelist
      this.catelist = res.data.result
      console.log(this.catelist)
      //   储存获取到的总数据数
      this.total = res.data.total
    },
    // 监听pagesize改变
    handleSizeChange(newSize) {
      this.querInfo.pagesize = newSize
      this.getCateList()
    },
    // 监听页码值发生变化
    handleCurrentChange(newPage) {
      this.querInfo.pagenum = newPage
      this.getCateList()
    },
    // 弹出添加分类对话框
    showAddCateDialog() {
      //   先获取父级分类的列表
      this.getParentCateList()
      this.addCateDialogVisible = true
    },
    // 获取父级分类数据列表
    async getParentCateList() {
      const { data: res } = await this.$http.get('categories', {
        params: { type: 2 }
      })

      if (res.meta.status !== 200) {
        return this.$message.error('获取父级分类数据失败！')
      }
      console.log(res.data)
      this.parentCateList = res.data
    },
    // 级联选择器发生变化就触发事件
    parentCateChanged() {
      console.log(this.selectedKeys)
      // 如果selectedKeys数组长度大于零分类为选中状态
      if (this.selectedKeys.length > 0) {
        // 父级分类的id
        this.addCateForm.cat_pid = this.selectedKeys[this.selectedKeys.length - 1]
        // 为当前分类赋值 会发现等级和此数组长度是相等的
        this.addCateForm.cat_level = this.selectedKeys.length
        return 0
      } else {
        this.addCateForm.cat_pid = 0
        // 为当前分类赋值 会发现等级和此数组长度是相等的
        this.addCateForm.cat_level = 0
      }
    },
    // 点击按钮添加分类
    addCate() {
      this.$refs.addCateFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.post(
          'categories',
          this.addCateForm
        )
        if (res.meta.status !== 201) {
          return this.$message.error('添加分类失败！')
        }
        this.$message.success('添加分类成功！')
        // 刷新列表
        this.getCateList()
        this.addCateDialogVisible = false
      })
    },
    // 监听对话框关闭事件
    addCateDialogClosed() {
      this.$refs.addCateFormRef.resetFields()
    },
    // 删除
    async del(id) {
      // 弹窗询问用户是否删除
      const confirmResult = await this.$confirm(
        '确定要删除此分类信息吗',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确定删除返回值是字符串confirm
      // 如果用户取消删除返回字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      const { data: res } = await this.$http.delete('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功')
      this.getCateList()
    },
    // 打开修改对话框将对象值传给对话框
    async edit(id) {
      const { data: res } = await this.$http.get('categories/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('失败')
      }
      this.editCateDialogVisible = true
      this.editCateForm = res.data
    },
    // 确定对话框提交修改数据
    editover() {
      this.$refs.editCateFormRef.validate(async valid => {
        if (!valid) {
          return 0
        }
        const { data: res } = await this.$http.put(
          'categories/' + this.editCateForm.cat_id,
          { cat_name: this.editCateForm.cat_name }
        )
        if (res.meta.status !== 200) {
          return this.$message.error('修改失败!')
        }
        this.getCateList()
        this.editCateDialogVisible = false
        this.$message.success('修改成功！')
      })
    },
    // 监听修改对话框关闭
    editCateDialogClosed() {
      this.$refs.editCateFormRef.resetFields()
    }
  }
}
</script>

<style lang="less" scoped>
.tree-table {
  margin-top: 15px;
}
.el-cascader {
  width: 100%;
}
</style>
