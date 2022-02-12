<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>活动管理</el-breadcrumb-item>
      <el-breadcrumb-item>活动发布</el-breadcrumb-item>
    </el-breadcrumb>
    <el-card>
      <el-row>
        <el-col :span="11">
          <el-button @click="add" type="primary">添加新闻</el-button>
          <el-table :data="tableData" style="width: 100%">
            <el-table-column align="center" prop="title" label="新闻题目">
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="edit(scope.row)"
                  >修改</el-button
                >
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
        </el-col>
        <el-col :span="2">
          <div>&nbsp;</div>
        </el-col>
        <el-col :span="11">
          <el-table :data="tableData2" style="width: 100%">
            <el-table-column align="center" prop="title" label="轮播图">
              <template slot-scope="scope">
                <img :src="scope.row.imageUrl" style="width: 200px" alt="" />
              </template>
            </el-table-column>
            <el-table-column align="center" label="操作">
              <template slot-scope="scope">
                <el-button
                  type="primary"
                  icon="el-icon-edit"
                  size="mini"
                  @click="edit2(scope.row)"
                  >修改</el-button
                >
              </template>
            </el-table-column>
          </el-table>
          <!-- 新闻添加 -->
          <el-dialog
            title="新闻活动图添加"
            :visible.sync="addCateDialogVisible"
            width="50%"
          >
            <el-form :model="thenewNew" label-width="100px">
              <el-form-item label="新闻标题">
                <el-input v-model="thenewNew.title"></el-input>
              </el-form-item>
            </el-form>
            <span style="margin-left: 30px">新闻活动图上传</span>
            <el-upload
              class="avatar-uploader"
              :headers="myHeaders"
              action="http://192.168.2.144:8001/api/file"
              :show-file-list="false"
              :on-success="handleAvatarSuccess3"
            >
              <img v-if="imageUrl3" :src="imageUrl3" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <span slot="footer" class="dialog-footer">
              <el-button @click="addCateDialogVisible = false">取 消</el-button>
              <el-button type="primary" @click="editCate">确 定</el-button>
            </span>
          </el-dialog>
          <!-- 新闻修改   -->
          <el-dialog
            title="新闻修改"
            :visible.sync="editCateDialogVisible"
            width="50%"
          >
            <el-form :model="theNew" label-width="100px">
              <el-form-item label="新闻标题">
                <el-input v-model="theNew.title"></el-input>
              </el-form-item>
            </el-form>
            <span style="margin-left: 30px">新闻图上传</span>
            <el-upload
              class="avatar-uploader"
              :headers="myHeaders"
              action="http://192.168.2.144:8001/api/file"
              :show-file-list="false"
              :on-success="handleAvatarSuccess2"
            >
              <img v-if="imageUrl2" :src="imageUrl2" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <span slot="footer" class="dialog-footer">
              <el-button @click="editCateDialogVisible = false"
                >取 消</el-button
              >
              <el-button type="primary" @click="editCate2">确 定</el-button>
            </span>
          </el-dialog>
          <!-- 轮播修改 -->
          <el-dialog
            title="轮播图修改"
            :visible.sync="editCateDialogVisible2"
            width="50%"
          >
            <span style="margin-left: 30px">轮播图上传</span>
            <el-upload
              style="margin-top: 30px"
              class="avatar-uploader"
              :headers="myHeaders"
              action="http://192.168.2.144:8001/api/file"
              :show-file-list="false"
              :on-success="handleAvatarSuccess"
            >
              <img v-if="imageUrl" :src="imageUrl" class="avatar" />
              <i v-else class="el-icon-plus avatar-uploader-icon"></i>
            </el-upload>
            <span slot="footer" class="dialog-footer">
              <el-button @click="editCateDialogVisible2 = false"
                >取 消</el-button
              >
              <el-button type="primary" @click="editCate3">确 定</el-button>
            </span>
          </el-dialog>
        </el-col>
      </el-row>
    </el-card>
  </div>
</template>

<script>
export default {
  data() {
    return {
      myHeaders: {
        Authorization: 'Bearer ' + window.sessionStorage.getItem('token'),
      },
      tableData: [],
      tableData2: [],
      imageUrl: '',
      imageUrl2: '',
      imageUrl3: '',
      editCateDialogVisible: false,
      editCateDialogVisible2: false,
      addCateDialogVisible: false,
      thenewNew:{title: ''},
      //点击新闻
      theNew: { title: '', imageUrl: '' },
      //轮播id
      thelbId:''
    }
  },
  methods: {
    async getnew() {
      const { data: res } = await this.$http.get('news')
      this.tableData = res.result
      console.log(this.tableData)
    },
    async getpic() {
      const { data: res } = await this.$http.get('banner')
      this.tableData2 = res.result
      console.log(this.tableData2)
    },
    //删除新闻
    async removeParams(id) {
        console.log(id)
        const {data:res} = await this.$http.delete('news/'+id)
        if(res.isSucceed){
            this.getnew()
            return this.$message.success('删除新闻成功')
        }
        this.$message.success('删除新闻失败')
    },
    //删除轮播图
    async removeParams2(id) {},
    handleAvatarSuccess(res) {
      this.imageUrl = res.result.imageUrl
    },
    handleAvatarSuccess2(res) {
      this.imageUrl2 = res.result.imageUrl
    },
    handleAvatarSuccess3(res) {
      this.imageUrl3 = res.result.imageUrl
    },
    //新闻添加
    add() {
      this.addCateDialogVisible = true
    },
    //新闻修改
    edit(item) {
      this.editCateDialogVisible = true
      this.theNew = item
      console.log(item)
      this.imageUrl2 = item.imageUrl
    },
    //轮播图修改
    edit2(item) {
      this.editCateDialogVisible2 = true
      this.imageUrl = item.imageUrl
      this.thelbId = item.id
    },
    //添加新闻确认
    async editCate(){
        console.log('jsb')
        const {data:res} = await this.$http.post('news',{Title:this.thenewNew.title,ImageUrl:this.imageUrl3})
        if(res.isSucceed){
            this.getnew()
            this.addCateDialogVisible=false
            return this.$message.success('添加新闻成功')
        }
        this.addCateDialogVisible=false
        this.$message.success('添加新闻失败')
    },
    //修改新闻确认
    async editCate2(){
        const {data:res} = await this.$http.put('news/'+this.theNew.id,{Title:this.theNew.title,ImageUrl:this.imageUrl2})
        if(res.isSucceed){
            this.getnew()
            this.editCateDialogVisible=false
            return this.$message.success('修改新闻成功')
        }
        this.editCateDialogVisible=false
        this.$message.success('修改新闻失败')
    },
    //修改轮播确认
    async editCate3(){
        const {data:res} = await this.$http.put('banner/'+this.thelbId,{Mid:0,ImageUrl:this.imageUrl})
        if(res.isSucceed){
            this.getpic()
            this.editCateDialogVisible2=false
            return this.$message.success('修改轮播成功')
        }
        this.editCateDialogVisible2=false
        this.$message.success('修改轮播失败')
    }
  },
  created() {
    this.getnew()
    this.getpic()
  },
}
</script>

<style lang="less" scoped>
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