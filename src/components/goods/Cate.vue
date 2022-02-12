<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品分类</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 上级权限添加分类 -->
    <el-card>
      <el-row>
        <el-col :span="3">
          <el-button type="primary" @click="showAddCateDialog"
            >添加分类</el-button
          >
        </el-col>
      </el-row>
      <el-table
    :data="tableData"
    style="width: 100%">
    <el-table-column
    label="分类名"
    prop="name"
    >
    </el-table-column>
    <el-table-column label="操作">
      <template slot-scope="scope">
        <el-button
          size="mini"
          @click="handleEdit(scope.row)">编辑</el-button>
        <el-button
          size="mini"
          type="danger"
          @click="handleDelete(scope.row)">删除</el-button>
      </template>
    </el-table-column>
  </el-table>
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
    >
      <!-- 添加分类表单 -->
      <el-form
        :model="addCateForm"
        ref="addCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称">
          <el-input v-model="addCateForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span style="margin-left:30px">侧边栏图标上传:</span>
        <el-upload
          class="avatar-uploader"
          action="http://192.168.2.144:8001/api/file"
          :show-file-list="false"
          :on-success="handleAvatarSuccess"
          :before-upload="beforeAvatarUpload"
        >
          <img v-if="imageUrl" :src="imageUrl" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="addCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="addCate">确 定</el-button>
      </span>
    </el-dialog>
    <!-- 修改分类的对话框 -->
    <el-dialog
      title="分类修改"
      :visible.sync="editCateDialogVisible"
      width="50%"
    >
      <!-- 修改分类表单 -->
      <el-form
        :model="editCateForm"
        ref="editCateFormRef"
        label-width="100px"
      >
        <el-form-item label="分类名称" prop="cat_name">
          <el-input v-model="editCateForm.name"></el-input>
        </el-form-item>
      </el-form>
      <span style="margin-left:30px">侧边栏图标上传:</span>
        <el-upload
          class="avatar-uploader"
          action="http://192.168.2.144:8001/api/file"
          :show-file-list="false"
          :on-success="handleAvatarSuccess2"
          :before-upload="beforeAvatarUpload2"
        >
          <img v-if="imageUrl2" :src="imageUrl2" class="avatar" />
          <i v-else class="el-icon-plus avatar-uploader-icon"></i>
        </el-upload>
      <span slot="footer" class="dialog-footer">
        <el-button @click="editCateDialogVisible = false">取 消</el-button>
        <el-button type="primary" @click="editCate">确 定</el-button>
      </span>
    </el-dialog>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      tableData: [],
      // 查询条件
      querInfo: {
        type: 3,
        pagenum: 1,
        pagesize: 5,
      },
      // 商品分类数据列表
      catelist: [],
      //   总数据数
      total: 0,
      //   给table指定列的定义
      columns: [
        {
          label: '分类名称',
          prop: 'cat_name',
        },
        {
          label: '是否有效',
          type: 'template',
          //   表示当前这一列使用模版名称
          template: 'isok',
        },
        {
          label: '排序',
          type: 'template',
          //   表示当前这一列使用模版名称
          template: 'order',
        },
        {
          label: '操作',
          type: 'template',
          //   表示当前这一列使用模版名称
          template: 'opt',
        },
      ],
      //   控制添加分类对话框显示与隐藏
      addCateDialogVisible: false,
      // 添加分类的表单数据对象
      addCateForm: {
        name: '',
      },
            // 添加分类的表单数据对象
      // 添加分类的表单校验规则

      //   父级分类的列表
      parentCateList: [],
      //   选中的父级分类的Id数组
      selectedKeys: [],
      // 控制修改对话框显示与隐藏
      editCateDialogVisible: false,
      // 修改的数据
      editCateForm: {},
      imageUrl: '',
      imageUrl2: '',
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    handleEdit(row) {
      console.log(row);
      this.editCateForm = row
      this.imageUrl2=row.icon
      this.editCateDialogVisible=true
      },
    async handleDelete(row) {
      this.editCateForm = row
      var that = this
      const { data: res } = await axios.delete(
        `http://192.168.2.144:8001/api/category/${that.editCateForm.id}`
      )
      console.log(res)
    },
    //图片上传
    handleAvatarSuccess(res, file) {
      this.imageUrl = res.result.imageUrl
    },
    beforeAvatarUpload(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
        //图片上传
    handleAvatarSuccess2(res, file) {
      console.log(res)
      this.imageUrl2 = res.result.imageUrl
    },
    beforeAvatarUpload2(file) {
      const isJPG = file.type === 'image/jpeg'
      const isLt2M = file.size / 1024 / 1024 < 2
      if (!isLt2M) {
        this.$message.error('上传头像图片大小不能超过 2MB!')
      }
      return isJPG && isLt2M
    },
    // 获取商品分类数据
    async getCateList() {
      // const { data: res } = await this.$http.get('categories', {
      //   params: this.querInfo,
      // })
      // if (res.meta.status !== 200) {
      //   return this.$message.error('获取商品分类失败!')
      // }
      //   将获取到的数据存到catelist
      let res = await this.$http.get('http://192.168.2.144:8001/api/category/')
      console.log(res)
      this.tableData = res.data.result
      //   储存获取到的总数据数
      // this.total = res.data.total
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
      this.addCateDialogVisible = true
    },
    // 点击按钮添加分类
    async addCate() {
      // this.$refs.addCateFormRef.validate(async (valid) => {
      //   if (!valid) return
      //   const { data: res } = await this.$http.post(
      //     'categories',
      //     this.addCateForm
      //   )
      //   if (res.meta.status !== 201) {
      //     return this.$message.error('添加分类失败！')
      //   }
      //   this.$message.success('添加分类成功！')
      //   // 刷新列表
      //   this.getCateList()
      //   this.addCateDialogVisible = false
      // })
      var that = this
      const { data: res } = await axios.post(
        `http://192.168.2.144:8001/api/category/`,{Name:that.addCateForm.name,Icon:that.imageUrl}
      )
      let res2 = await this.$http.get('http://192.168.2.144:8001/api/category/')
      this.tableData = res2.data.result
      this.$message.success('添加成功！')
      this.addCateDialogVisible = false
      //   储存获取到的总数据数
      // this.total = res.data.total
    },
    editCateDialogClosed(){
      this.editCateDialogVisible=false
    },
    //分类修改
    async editCate(){
      var that = this
      const { data: res } = await axios.put(
        `http://192.168.2.144:8001/api/category/${that.editCateForm.id}`,{Name:that.editCateForm.name,Icon:that.imageUrl2}
      )
      console.log(res)
      this.$message.success('修改成功！')
      this.editCateDialogVisible = false
    }
  },
}
</script>

<style lang="less" scoped>
.el-cascader {
  width: 100%;
}
.avatar-uploader {
  margin-top: 30px;
  margin-left:30px;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
}
.avatar-uploader .el-upload:hover {
  border-color: #409eff;
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  line-height: 178px;
  text-align: center;
}
.avatar {
  width: 178px;
  height: 178px;
  display: block;
}
</style>
