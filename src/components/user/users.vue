<template>
  <div>
    <!-- 面包屑导航区 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>用户列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 -->
    <el-card class="box-card">
      <!-- 栅格：共24个单位宽度 gutter属性是列和列之间的距离 -->
      <el-row :gutter="20">
        <el-col :span="7">
          <el-input
            placeholder="请输入内容"
            v-model="queryInfo.query"
            clearable
            @clear="getUserList"
          >
            <el-button
              slot="append"
              icon="el-icon-search"
              @click="getUserList"
            ></el-button>
          </el-input>
        </el-col>
        <el-col :span="4">
          <el-button type="primary" @click="addDialogVisible = true"
            >添加用户</el-button
          >
        </el-col>
      </el-row>
      <!-- 用户列表页 prop为userList中字段属性名 border加边框 stripe斑马 -->
      <el-table :data="userList" border stripe>
        <el-table-column type="index"></el-table-column>
        <el-table-column
          align="center"
          label="姓名"
          prop="userName"
        ></el-table-column>
        <el-table-column
          align="center"
          label="性别"
          prop="gender"
        ></el-table-column>
        <el-table-column
          align="center"
          label="店铺"
          prop="bName"
        ></el-table-column>
        <el-table-column
          align="center"
          label="角色"
          prop="roleName"
        ></el-table-column>
        <el-table-column align="center" label="操作">
          <template slot-scope="scope">
            <!-- 修改 -->
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row)"
            ></el-button>
            <!-- 删除 -->
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.sid)"
            ></el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 页脚分页 -->
      <div class="block">
        <span class="demonstration"></span>
        <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="queryInfo.pagenum"
          :page-sizes="[1, 2, 5, 10]"
          :page-size="queryInfo.pagesize"
          layout="total, sizes, prev, pager, next, jumper"
          :total="total"
        ></el-pagination>
      </div>
    </el-card>
    <!-- 添加用户 -->
    <!-- visible.sync控制对话框显示隐藏 -->
    <el-dialog
      title="添加用户"
      :visible.sync="addDialogVisible"
      width="50%"
      @close="addDialogClosed"
    >
      <!-- 内容主体区 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="70px"
      >
        <el-form-item label="帐号" prop="Account">
          <el-input v-model="addForm.Account"></el-input>
        </el-form-item>
        <el-form-item label="用户名" prop="Name">
          <el-input v-model="addForm.Name"></el-input>
        </el-form-item>
        <el-form-item label="性别" prop="Gender">
          <el-radio v-model="addForm.Gender" label="0">男</el-radio>
          <el-radio v-model="addForm.Gender" label="1">女</el-radio>
        </el-form-item>
        <el-form-item label="密码" prop="Password">
          <el-input v-model="addForm.Password"></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="Rid">
          <el-cascader
            :options="roleList"
            :props="{ value: 'id', label: 'name' }"
            v-model="addForm.Rid"
            @change="roleHandleChange"
            clearable
            change-on-select
            expand-trigger="hover"
          ></el-cascader>
        </el-form-item>
        <el-form-item v-if="Rid==1" label="店铺" prop="Bid">
          <el-cascader
            :options="shopList"
            :props="{ value: 'id', label: 'name' }"
            v-model="addForm.Bid"
            @change="shopHandleChange"
            clearable
            change-on-select
            expand-trigger="hover"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog
      title="修改用户"
      :visible.sync="editDialogVisible"
      width="50%"
      @close="editDialogClosed"
    >
      <el-form
        :model="editForm"
        :rules="editFormRules"
        ref="editFormRef"
        label-width="70px"
      >
        <el-form-item label="用户名">
          <el-input v-model="editForm.userName" disabled></el-input>
        </el-form-item>
        <el-form-item label="角色" prop="Rid">
          <el-cascader
            :options="roleList"
            :props="{ value: 'id', label: 'name' }"
            v-model="editForm.Rid"
            @change="roleHandleChange"
            clearable
            change-on-select
            expand-trigger="hover"
          ></el-cascader>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
// ctrl+B隐藏侧边栏
export default {
  data() {
    //   自定义邮箱验证
    var checkEmail = (rule, value, cb) => {
      const regEmail = /^([a-zA-Z0-9_-])+@([a-zA-Z0-9_-])+(\.[a-zA-Z0-9_-])+/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法邮箱'))
    }
    // 自定义手机号验证 rule是验证规则value是验证的值cb是回调函数
    var checkMobile = (rule, value, cb) => {
      const regEmail = /^(0|86|17951)?(13[0-9]|15[0123456789]|17[678]|18[0-9]|14[57])[0-9]{8}$/
      if (regEmail.test(value)) {
        return cb()
      }
      cb(new Error('请输入合法手机号'))
    }
    return {
      // 获取用户列表的参数对象
      queryInfo: {
        query: '',
        // 当前页数
        pagenum: 1,
        // 当前页显示数据个数
        pagesize: 2,
      },
      Rid:'',
      userList: [],
      total: 0,
      //   控制对话框显示隐藏
      addDialogVisible: false,
      //   添加用户表单数据
      addForm: {
        Gender: '0',
      },
      //   添加用户表单验证
      addFormRules: {
        Account: [
          { required: true, message: '请输入帐号', trigger: 'blur' },
          { min: 3, max: 10, message: '请输入3到10为用户名', trigger: 'blur' },
        ],
        Name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        Gender: [{ required: true, message: '请选择性别', trigger: 'blur' }],
        Password: [
          { required: true, message: '请输入密码', trigger: 'blur' },
          { min: 6, max: 10, message: '请输入6到15为密码', trigger: 'blur' },
        ],
        Rid: [{ required: true, message: '请选择角色', trigger: 'blur' }],
        Bid: [{ required: true, message: '请选择店铺', trigger: 'blur' }],
        // email: [
        //   { required: true, message: '请输入邮箱', trigger: 'blur' },
        //   { validator: checkEmail, trigger: 'blur' }
        // ],
        // mobile: [
        //   { required: true, message: '请输入手机号', trigger: 'blur' },
        //   { validator: checkMobile, trigger: 'blur' }
        // ]
      },
      // 控制修改用户对话框显示与隐藏
      editDialogVisible: false,
      // 查询到的用户信息
      editForm: {},
      editFormRules: {
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { validator: checkEmail, trigger: 'blur' },
        ],
        mobile: [
          { required: true, message: '请输入手机号', trigger: 'blur' },
          { validator: checkMobile, trigger: 'blur' },
        ],
      },
      // 需要被分配角色的用户信息
      userinfo: {},
      //角色下拉框
      roleList: [],
      //店铺下拉框
      shopList: [],
    }
  },
  created() {
    this.Rid = window.sessionStorage.getItem('Rid')
    this.getUserList()
  },
  methods: {
    //角色下拉框
    roleHandleChange() {
      console.log(this.addForm.Rid)
      console.log(this.editForm.Rid)
    },
    //店铺下拉框
    async shopHandleChange() {
      const { data: res } = await this.$http.get('businesses/getShop')
      console.log(res)
      this.shopList = res.result
    },
    async getUserList() {
      this.shopHandleChange()
      // 权限渲染角色
      let role = window.sessionStorage.getItem('Rid')
      if (role == 1) {
        this.roleList = [
          { id: 1, name: '管理员' },
          { id: 2, name: '店长' },
        ]
        const { data: res } = await this.$http.get(`staff`)
        if (res.isSucceed) {
          this.userList = res.result
          return this.$message.success('获取用户列表成功')
        }
      }
      if (role == 2) {
        this.roleList = [{ id: 3, name: '员工' }]
        const { data: res } = await this.$http.get(
          `staff/${window.sessionStorage.getItem('bid')}`
        )
        if (res.isSucceed) {
          this.userList = res.result
          return this.$message.success('获取用户列表成功')
        }
      }

      // this.total = res.data.total
    },
    // 监听pagesize改变事件
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getUserList()
    },
    // 监听页码值
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getUserList()
    },
    // 监听添加用户对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 点击按钮，添加新用户
    async addUser() {
      console.log(this.addForm)
      let push = {
        Account: this.addForm.Account,
        Bid: this.addForm.Bid[0],
        Gender: parseFloat(this.addForm.Gender[0]),
        Name: this.addForm.Name,
        Password: this.addForm.Password,
        Rid: this.addForm.Rid[0],
      }
      const { data: res } = await this.$http.post('staff', push)
      console.log(res)
      if (!res.isSucceed) {
        this.$message.error('添加用户失败')
      }
      this.$message.success('添加用户成功')
      // 关闭对话框
      this.addDialogVisible = false
      // 从新请求数据
      this.getUserList()
    },
    //修改对话框弹窗
    async showEditDialog(item) {
      this.editDialogVisible = true
      this.editForm = item
      this.editForm.Rid = [item.rid]
      console.log(this.editForm)
      console.log(item)
    },
    // 监听修改用户对话框的关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 修改用户信息并验证
    editUserInfo() {
      this.$refs.editFormRef.validate(async (valid) => {
        if (!valid) {
          return
        }
        const { data: res } = await this.$http.put(
          'users/' + this.editForm.id,
          { email: this.editForm.email, mobile: this.editForm.mobile }
        )
        if (res.meta.status !== 200) {
          this.$message.error('修改失败')
        }
        // 关闭对话框
        this.editDialogVisible = false
        // 更新列表
        this.getUserList()
        // 提示更新成功
        this.$message.success('修改成功')
      })
    },
    // 根据id删除对应用户信息
    async removeUserById(id) {
      // 弹窗询问用户是否删除
      const confirmResult = await this.$confirm(
        '确定要删除此用户信息吗',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning',
        }
      ).catch((err) => err)
      // 如果用户确定删除返回值是字符串confirm
      // 如果用户取消删除返回字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      const { data: res } = await this.$http.delete('staff/' + id)
      if (!res.isSucceed) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功')
      this.getUserList()
    },
  },
}
</script>

<style lang="less" scoped>
</style>
