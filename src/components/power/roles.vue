<template>
  <div>
    <!-- 面包屑导航 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>权限管理</el-breadcrumb-item>
      <el-breadcrumb-item>角色列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图 -->
    <el-card>
      <!-- 添加角色按钮区域 -->
      <el-row>
        <el-col>
          <el-button type="primary" @click="addDialogVisible = true">添加角色</el-button>
        </el-col>
      </el-row>
      <!-- 角色列表 -->
      <el-table :data="rolelist" border stripe>
        <!-- 展开列 -->
        <el-table-column type="expand">
          <template slot-scope="scope">
            <el-row
              :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']"
              v-for="(item1, i1) in scope.row.children"
              :key="item1.id"
            >
              <!-- 一级权限 -->
              <el-col :span="5">
                <el-tag closable @close="removeRightById(scope.row, item1.id)">{{item1.authName}}</el-tag>
                <i class="el-icon-caret-right"></i>
              </el-col>
              <!-- 二三级权限 -->
              <el-col :span="19">
                <el-row
                  :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']"
                  v-for="(item2, i2) in item1.children"
                  :key="item2.id"
                >
                  <el-col :span="6">
                    <el-tag
                      type="success"
                      closable
                      @close="removeRightById(scope.row, item2.id)"
                    >{{item2.authName}}</el-tag>
                    <i class="el-icon-caret-right"></i>
                  </el-col>
                  <el-col :span="13">
                    <!-- closable给标签加上关闭按钮再绑定close监听事件 -->
                    <el-tag
                      closable
                      @close="removeRightById(scope.row, item3.id)"
                      :class="[i3 === 0 ? '' : 'bdtap' ]"
                      type="warning"
                      v-for="(item3, i3) in item2.children"
                      :key="item3.id"
                      style="margin-left: 10px"
                    >{{item3.authName}}</el-tag>
                  </el-col>
                </el-row>
              </el-col>
            </el-row>
          </template>
        </el-table-column>
        <!-- 索引列 -->
        <el-table-column type="index"></el-table-column>
        <el-table-column label="角色名称" prop="roleName"></el-table-column>
        <el-table-column label="角色描述" prop="roleDesc"></el-table-column>
        <el-table-column label="操作" width="300px">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="showEditDialog(scope.row.id)"
            >编辑</el-button>
            <el-button
              type="danger"
              icon="el-icon-delete"
              size="mini"
              @click="removeUserById(scope.row.id)"
            >删除</el-button>
            <el-button
              type="warning"
              icon="el-icon-setting"
              size="mini"
              @click="showSetRightDialog(scope.row)"
            >分配权限</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
    <!-- 添加角色 -->
    <!-- visible.sync控制对话框显示隐藏 -->
    <el-dialog title="添加角色" :visible.sync="addDialogVisible" width="30%" @close="addDialogClosed">
      <!-- 内容主体区 -->
      <el-form :model="addForm" :rules="addFormRules" ref="addFormRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="addForm.roleName"></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="addForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <!-- 底部区 -->
      <span slot="footer" class="dialog-footer">
        <el-button @click="addDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addUser">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改用户对话框 -->
    <el-dialog title="修改角色" :visible.sync="editDialogVisible" width="50%" @close="editDialogClosed">
      <el-form :model="editForm" :rules="editFormRules" ref="editFormRef" label-width="70px">
        <el-form-item label="角色名" prop="roleName">
          <el-input v-model="editForm.roleName" disabled></el-input>
        </el-form-item>
        <el-form-item label="描述" prop="roleDesc">
          <el-input v-model="editForm.roleDesc"></el-input>
        </el-form-item>
      </el-form>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editUserInfo">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 分配权限对话框 -->
    <el-dialog
      title="分配权限"
      :visible.sync="setRightDialogVisible"
      width="50%"
      @close="setRightDialogClosed"
    >
      <!-- 树形控件 data为要绑定的数组,props是和子数组响应实现嵌套node-key是作为每个节点唯一标识属性default-expand-all是否默认展开所有节点-->
      <!-- default-checked-keys默认勾选节点的key数组 -->
      <el-tree
        ref="treeProps"
        :data="rightslist"
        :props="treeProps"
        show-checkbox
        node-key="id"
        default-expand-all
        :default-checked-keys="defkeys"
      ></el-tree>
      <span slot="footer" class="dialog-footer">
        <el-button @click="dialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="allotRights">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
export default {
  data() {
    return {
      // 角色列表数据
      rolelist: [],
      // 添加用户弹窗状态
      addDialogVisible: false,
      // 修改用户弹窗状态
      editDialogVisible: false,
      // 添加角色信息
      addForm: {
        roleName: '',
        roleDesc: ''
      },
      // 查询到的修改用户信息
      editForm: {},
      addFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 1, max: 10, message: '请输入1到10为角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 1, max: 15, message: '角色描述允许1-15字', trigger: 'blur' }
        ]
      },
      editFormRules: {
        roleName: [
          { required: true, message: '请输入角色名', trigger: 'blur' },
          { min: 3, max: 10, message: '请输入1到10为角色名', trigger: 'blur' }
        ],
        roleDesc: [
          { required: true, message: '请输入角色描述', trigger: 'blur' },
          { min: 1, max: 15, message: '角色描述允许1-15字', trigger: 'blur' }
        ]
      },
      // 控制分配权限对话框显示与隐藏
      setRightDialogVisible: false,
      // 所有权限数据
      rightslist: [],
      treeProps: {
        // 以什么名称为子树父子嵌套
        children: 'children',
        // 谁的扩展看的是哪一个属性
        lable: 'authName'
      },
      // 默认选中的节点ID值数组
      defkeys: [],
      // 获取当前角色id
      roleId: ''
    }
  },
  created() {
    this.getRolesList()
  },
  methods: {
    // 获取角色列表
    async getRolesList() {
      const { data: res } = await this.$http.get('roles')
      if (res.meta.status !== 200) {
        return this.$message.error('角色列表获取失败')
      }
      console.log(res)
      this.rolelist = res.data
    },
    // 监听添加用户对话框关闭事件
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    // 监听添加用户对话框关闭事件
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    // 添加角色
    addUser() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        // 验证通过可以访问
        const { data: res } = await this.$http.post('roles', this.addForm)
        console.log(res)
        if (res.meta.status !== 201) {
          return this.$message.error('添加角色失败')
        }
        this.$message.success('添加用户成功')
        // 关闭窗口
        this.addDialogVisible = false
        // 重新加载数据
        this.getRolesList()
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
          type: 'warning'
        }
      ).catch(err => err)
      // 如果用户确定删除返回值是字符串confirm
      // 如果用户取消删除返回字符串cancel
      if (confirmResult !== 'confirm') {
        return this.$message.info('已经取消删除')
      }

      const { data: res } = await this.$http.delete('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('删除用户失败！')
      }
      this.$message.success('删除用户成功')
      this.getRolesList()
    },
    // 修改角色数据添加
    async showEditDialog(id) {
      const { data: res } = await this.$http.get('roles/' + id)
      if (res.meta.status !== 200) {
        return this.$message.error('查询角色失败')
      }
      this.editForm = res.data
      this.editDialogVisible = true
    },
    // 修改角色并验证
    editUserInfo() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const { data: res } = await this.$http.put(
          'roles/' + this.editForm.roleId,
          {
            roleName: this.editForm.roleName,
            roleDesc: this.editForm.roleDesc
          }
        )
        console.log(res)
        if (res.meta.status !== 200) {
          return this.$message.error('修改角色失败')
        }
        this.$message.success('修改角色成功')
        this.editDialogVisible = false
        this.getRolesList()
      })
    },
    // 根据Id删除对应权限
    async removeRightById(role, rightId) {
      // 弹窗提示用户是否要删除
      const confirmResult = await this.$confirm(
        '确定要删除此用户信息吗',
        '提示',
        {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
        }
      ).catch(err => err)
      if (confirmResult !== 'confirm') {
        return this.$message.info('取消了删除')
      }
      // ``表示字符串
      const { data: res } = await this.$http.delete(
        `roles/${role.id}/rights/${rightId}`
      )
      if (res.meta.status !== 200) {
        return this.$message.error('删除失败')
      }
      // 不建议this.getRolesList()页面会完整刷新需要局部刷新
      role.children = res.data
    },
    // 展示分配权限的对话框
    async showSetRightDialog(role) {
      // 获取所有权限
      this.roleId = role.id
      const { data: res } = await this.$http.get('rights/tree')
      if (res.meta.status !== 200) {
        return this.$message.error('获取权限列表失败')
      }
      // 获取权限数据保存到rightlist
      this.rightslist = res.data
      console.log(this.rightslist)
      // 递归获取三级节点id
      this.getLeafkeys(role, this.defkeys)
      this.setRightDialogVisible = true
    },
    // 通过递归的形式，获取角色下所有三级权限的id并保存到defkeys数组中
    getLeafkeys(node, arr) {
      // 如果当前node节点不包括children属性就是三级节点
      if (!node.children) {
        return arr.push(node.id)
      }
      node.children.forEach(item => this.getLeafkeys(item, arr))
    },
    // 监听分配权限对话框关闭事件
    setRightDialogClosed() {
      this.defkeys = []
    },
    // 点击为角色分配权限
    async allotRights() {
      const keys = [
        ...this.$refs.treeProps.getCheckedKeys(),
        ...this.$refs.treeProps.getHalfCheckedKeys()
      ]
      const idStr = keys.join(',')
      console.log(idStr)
      console.log(this.roleId)
      const { data: res } = await this.$http.post(`roles/${this.roleId}/rights`, {
        rids: idStr
      })
      if (res.meta.status !== 200) {
        console.log(res)
        return this.$message.error('分配权限失败!')
      }
      this.$message.success('分配权限成功!')
      this.getRolesList()
      this.setRightDialogVisible = false
    }
  }
}
</script>

<style lang="less" scoped>
.el-tag {
  margin-top: 10px;
  margin-bottom: 10px;
}

.bdtop {
  border-top: 1px solid #eee;
}

.bdbottom {
  border-bottom: 1px solid #eee;
}

.vcenter {
  display: flex;
  align-items: center;
}
</style>
