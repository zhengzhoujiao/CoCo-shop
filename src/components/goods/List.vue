<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>商品列表</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 :gutter列间距-->
    <el-card>
      <el-row :gutter="20">
        <el-col :span="8">
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
        <el-col :span="4">
          <el-button type="primary" @click="goAddpage">添加奶茶</el-button>
        </el-col>
      </el-row>
      <!-- table表格区 -->
      <el-table :data="goodslist" border stripe>
        <el-table-column align="center" type="index"></el-table-column>
        <el-table-column
          align="center"
          label="奶茶名称"
          prop="name"
        ></el-table-column>
        <el-table-column
          align="center"
          label="奶茶价格(元)"
          prop="price"
        ></el-table-column>
        <el-table-column
          align="center"
          label="分类"
          prop="categoryName"
        ></el-table-column>
        <el-table-column align="center" label="图片">
          <template slot-scope="scope">
            <img :src="scope.row.imageUrl" style="width: 50%" alt="" />
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center">
          <template slot-scope="scope">
            <el-button
              type="primary"
              icon="el-icon-edit"
              size="mini"
              @click="edit(scope.row)"
            ></el-button>
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
        @current-change="handleCurrentChange"
        :current-page="queryInfo.pagenum"
        :page-sizes="[5]"
        :page-size="queryInfo.pagesize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
      ></el-pagination>
    </el-card>
    <!-- 修改分类的对话框 -->
    <el-dialog
      title="奶茶修改"
      :visible.sync="editCateDialogVisible"
      width="50%"
      @close="editCateDialogClosed"
    >
      <!-- 添加分类表单 -->
      <el-form :model="theCar" label-width="100px">
        <el-form-item label="奶茶名">
          <el-input v-model="theCar.name"></el-input>
        </el-form-item>
        <el-form-item label="奶茶价钱">
          <el-input v-model="theCar.price"></el-input>
        </el-form-item>
        <el-form-item label="奶茶类别">
          <el-select v-model="theCar.cid" placeholder="请选择">
            <el-option
              v-for="item in catelist"
              :key="item.id"
              :label="item.name"
              :value="item.id"
            >
            </el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <span style="margin-left: 30px">奶茶图片上传:</span>
      <el-upload
        class="avatar-uploader"
        :headers="myHeaders"
        action="http://192.168.2.144:8001/api/file"
        :show-file-list="false"
        :on-success="handleAvatarSuccess"
        :before-upload="beforeAvatarUpload"
      >
        <img v-if="imageUrl" :src="imageUrl" class="avatar" />
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
import axios from 'axios'
export default {
  data() {
    return {
      myHeaders:{Authorization: 'Bearer '+window.sessionStorage.getItem('token')},
      // 查询参数对象
      queryInfo: {
        query: '',
        pagenum: 1,
        pagesize: 10,
      },
      //   当前页数据
      goodslist: [],
      // 总数据条数
      total: 0,
      editCateDialogVisible: false,
      editCateForm: {
        // 将要添加分类名
        name: '',
        // 父级分类的Id
        price: 0,
        // 分类等级默认1级
        kind: 0,
      },
      editCateFormRules: {
        cat_name: [
          { required: true, message: '请输入修改后值', trigger: 'blur' },
        ],
      },
      imageUrl: '',
      catelist: [],
      //当前点击奶茶
      theCar: {
        cid: [0],
      },
    }
  },
  created() {
    this.getGoodsList()
  },
  methods: {
    //图片上传
    handleAvatarSuccess(res) {
      console.log(res)
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
    //   根据分页获取对应的商品列表
    async getGoodsList() {
      const {
        data: res,
      } = await axios.get('http://192.168.2.144:8001/api/milktea/', {
        params: { keyword: this.queryInfo.query },
      })
      this.goodslist = res.result
      // this.total = res.data.total
      console.log(this.goodslist)
      const { data: res2 } = await this.$http.get('category')
      this.catelist = res2.result
    },
    handleSizeChange(newSize) {
      this.queryInfo.pagesize = newSize
      this.getGoodsList()
    },
    handleCurrentChange(newPage) {
      this.queryInfo.pagenum = newPage
      this.getGoodsList()
    },
    //奶茶修改
    async edit(goods) {
      this.imageUrl = goods.imageUrl
      this.theCar = goods
      this.editCateDialogVisible = true
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

      const { data: res } = await this.$http.delete(`milktea/${goodsid}`)
      if (!res.isSucceed) {
        return this.$message.error('删除失败')
      }
      this.$message.success('删除成功')
      this.getGoodsList()
    },
    // 跳转到添加页面
    goAddpage() {
      this.$router.push('/goods/add')
    },
    editCateDialogClosed() {
      this.editCateDialogVisible = false
    },
    // 级联选择器选中项发生变化会触发这个函数
    handleChange() {
      console.log(this.editCateForm.kind)
      if (this.editCateForm.kind.length !== 1) {
        this.editCateForm.kind = []
      }
    },
    //确认奶茶修改提交
    async editCate() {
      console.log(this.theCar)
      const{data:res} = await this.$http.put(`milktea/${this.theCar.id}`,{
        ImageUrl:this.imageUrl,
        OriPrice:parseFloat(this.theCar.price),
        Cid:this.theCar.cid,
        Intro:this.theCar.intro,
        Name:this.theCar.name
      })
      this.editCateDialogVisible=false
      this.getGoodsList()
      if(res.isSucceed){
        return this.$message.success('奶茶修改成功')
      }
      this.$message.error('奶茶修改失败')
    },
  },
}
</script>

<style lang="less" scoped>
.avatar-uploader {
  margin-top: 30px;
  margin-left: 30px;
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
