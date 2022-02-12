<template>
  <div>
    <!-- 面包屑导航栏 -->
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>商品管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加商品</el-breadcrumb-item>
    </el-breadcrumb>
    <!-- 卡片视图区域 :gutter列间距-->
    <el-card>
      <!-- 警告提示区域 -->
      <el-alert title="添加商品信息" type="info" center show-icon :closable="false"></el-alert>
      <!-- 进度条 进度条和侧边栏公用activeIndex字段实现联动但是进度条必须为数值类型因此进行运算符操作 -->
      <el-steps :space="200" :active="activeIndex - 0" finish-status="success" align-center>
        <el-step title="基本信息"></el-step>
        <el-step title="属性选择"></el-step>
        <el-step title="属性详情"></el-step>
        <el-step title="奶茶图片"></el-step>
        <el-step title="奶茶描述"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <!-- 左侧tabs栏label-position是让label在input上方 -->
      <el-form
        :model="addForm"
        :rules="addFormRules"
        ref="addFormRef"
        label-width="100px"
        label-position="top"
      >
        <el-tabs
          v-model="activeIndex"
          :tab-position="'left'"
          :before-leave="beforeTabLeave"
          @tab-click="tabClicked"
        >
          <el-tab-pane label="基本信息" name="0">
            <el-form-item label="奶茶名称" prop="Name">
              <el-input v-model="addForm.Name"></el-input>
            </el-form-item>
            <el-form-item label="奶茶价格" prop="OriPrice">
              <el-input v-model="addForm.OriPrice" type="number"></el-input>
            </el-form-item>
            <el-form-item label="所属分类" prop="Cid">
              <el-cascader
                :options="catelist"
                :props="{value:'id',label:'name'}"
                v-model="addForm.Cid"
                @change="handleChange"
                clearable
                change-on-select
                expand-trigger="hover"
              ></el-cascader>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品参数" name="1">
            <!-- 渲染表单的item项 -->
            <el-form-item :label="item.AttrCategory" v-for="item in manyTableData" :key="item.Id">
              <el-checkbox-group v-model="item.children">
                <el-checkbox :label="cb" v-for="(cb,i) in item.children" :key="i" border>{{cb.Name}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品属性" name="2">
            <el-form-item :label="item.AttrCategory" v-for="item in onlyTableData" :key="item.id">
              <el-checkbox-group v-model="item.children">
                <el-checkbox :label="cb" v-for="(cb,i) in item.children" :key="i" border>{{cb.name}}</el-checkbox>
              </el-checkbox-group>
            </el-form-item>
          </el-tab-pane>
          <el-tab-pane label="商品图片" name="3">
            <!-- action表示图片上传的api地址 on-preview预览的业务逻辑on-remove是点击叉号触发file-list文件列表list-type预览组件的方式-->
            <!-- 没有采用axios请求因此使用不了main.js的包装器需要:headers手动设置token on-success上传成功的钩子-->
            <el-upload
              action="http://192.168.2.144:8001/api/file"
              :on-preview="handlePreview"
              :on-remove="handleRemove"
              list-type="picture"
              :headers="headerObj"
              :on-success="handleSuccess"
            >
              <el-button size="small" type="primary">点击上传</el-button>
              <div slot="tip" class="el-upload__tip">只能上传jpg/png文件，且不超过500kb</div>
            </el-upload>
          </el-tab-pane>
          <el-tab-pane label="商品内容" name="4">
            <!-- 富文本编辑器组件 -->
            <quill-editor v-model="addForm.Intro"></quill-editor>
            <!-- 添加商品按钮 -->
            <el-button type="primary" class="btnAdd" @click="add">添加商品</el-button>
          </el-tab-pane>
        </el-tabs>
        <!-- 图片预览 -->
        <el-dialog title="图片预览" :visible.sync="previewVisible" width="50%">
          <img :src="previewPath" alt class="previewImg" />
        </el-dialog>
      </el-form>
    </el-card>
  </div>
</template>

<script>
import _ from 'lodash'
import axios from 'axios'
export default {
  data() {
    return {
      activeIndex: '0',
      // 添加商品的表单数据对象
      addForm: {
        Name: '',
        OriPrice: 0,
        // 商品所属的分类数组
        Cid: '',
        // 图片的数组
        ImageUrl: '',
        // 商品详情介绍
        Intro: '',
        // 大类别
        Attrs: [],
        // 小类别
        attrschildren:[]
      },
      addFormRules: {
        Name: [
          { required: true, message: '请输入商品名称', trigger: 'blur' }
        ],
        OriPrice: [
          { required: true, message: '请输入商品价格', trigger: 'blur' }
        ],
        goods_weight: [
          { required: true, message: '请输入商品重量', trigger: 'blur' }
        ],
        goods_number: [
          { required: true, message: '请输入商品数量', trigger: 'blur' }
        ],
        Cid: [
          { required: true, message: '请选择商品分类', trigger: 'blur' }
        ]
      },
      // 商品分类列表
      catelist: [],
      // 可选类别(大类别)
      manyTableData: [],
      // 静态参数列表(选后类别和详情)
      onlyTableData: [],
      // 图片上传组件的headers请求头对象
      headerObj: {
        Authorization: 'Bearer '+window.sessionStorage.getItem('token')
      },
      // 图片地址 服务器地址
      previewPath: '',
      // 监听图片对话框显示隐藏
      previewVisible: false
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    // 获取商品分类列表
    async getCateList() {
      // const { data: res } = await this.$http.get('categories')
      // if (res.meta.status !== 200) {
      //   return this.$message.error('查询商品分类列表失败！')
      // }
      // this.catelist = res.data
      // console.log(this.catelist)
      let res = await this.$http.get('http://192.168.2.144:8001/api/category/')
      console.log(res)
      this.catelist = res.data.result
    },
    // 级联选择器选中项发生变化会触发这个函数
    handleChange() {
      console.log(this.addForm.Cid)
      if (this.addForm.Cid.length !== 1) {
        this.addForm.Cid = ''
      }
    },
    // 标签页切换前
    beforeTabLeave(activeName, oldActiveName) {
      if (oldActiveName === '0' && this.addForm.Cid.length !== 1) {
        this.$message.error('请先选择商品分类！')
        return false
      }
    },
    async tabClicked() {
      // 证明访问的是动态参数面板
      if (this.activeIndex === '1') {
        this.manyTableData = [{Id:3077,AttrCategory:"属性选择",attr_sel:'many',children:[{Name:'加料',id:-1},{Name:'温度',id:0},{Name:'糖度',id:1}],attr_write:'list',cat_id:6,delete_time:null}]
      } else if (this.activeIndex === '2') {
        //根据所选属性渲染属性详情
        //选后类别详情 this.manyTableData[0].children 需要根据这个查小类别 先模拟
        this.onlyTableData = [{AttrCategory:'加料',children:[{Name:'常规'},{Name:'魔芋'},{Name:'珍珠'}]}
        ,{AttrCategory:'温度',children:[{Name:'常温'},{Name:'冰'},{Name:'少冰'}]}
        ,{AttrCategory:'糖度',children:[{Name:'正常糖'},{Name:'少糖'},{Name:'多糖'}]}]
        this.onlyTableData = []
        this.manyTableData[0].children.forEach(async item=>{
          if(item.id==-1){
            let res = await axios.get(`http://192.168.2.144:8001/api/attributes/?attrCategory=-1`)
            let newAttr = {}
            newAttr.AttrCategory='加料'
            newAttr.children=res.data.result
            this.onlyTableData.push(newAttr)
          }
          else if(item.id==0){
            let res = await axios.get(`http://192.168.2.144:8001/api/attributes/?attrCategory=0`)
            console.log(res)
            let newAttr = {}
            newAttr.AttrCategory='温度'
            newAttr.children=res.data.result
            this.onlyTableData.push(newAttr)
          }
          else if(item.id==1){
            let res = await axios.get(`http://192.168.2.144:8001/api/attributes/?attrCategory=1`)
            let newAttr = {}
            newAttr.AttrCategory='糖度'
            newAttr.children=res.data.result
            this.onlyTableData.push(newAttr)
          }
        })
        console.log('jsb')
        console.log(this.onlyTableData)
      }
      //最终的属性和属性详情信息
      console.log(this.manyTableData[0].children)
      this.addForm.Attrs=_.cloneDeep(this.onlyTableData)
    },
    // 处理图片预览效果
    handlePreview(file) {
      console.log(file)
      this.previewPath = file.response.data.url
      this.previewVisible = true
    },
    // 处理移除图片操作
    handleRemove(file) {
      // console.log(file)
      // // 1.获取将要删除的图片的临时路径
      // const filePath = file.response.data.tmp_path
      // // 2.从pics数组中，找到这个图片对应的索引值
      // const i = this.addForm.pics.findIndex(x => x.pic === filePath)
      // // 3.调用数组的splice方法，把图片信息对象，从pics数组中移除
      // this.addForm.ImageUrl.empty()
    },
    // 监听图片上传成功的事件
    handleSuccess(response) {
      // 1.拼接得到一个图片信息对象
      const picInfo = { pic: response.result.imageUrl }
      // 2.将图片信息对象,push到pics数组中
      this.addForm.ImageUrl=picInfo
      console.log(this.addForm)
    },
    // 添加商品
    async add() {
      let attrs = []
      this.addForm.Attrs.forEach(item=>{
        item.children.forEach(item2=>{
          attrs.push(item2.id)
        })
      })
      let postList = {MilkTea:{Name:this.addForm.Name,OriPrice:parseFloat(this.addForm.OriPrice),ImageUrl:this.addForm.ImageUrl.pic,Intro:this.addForm.Intro.substring(3,this.addForm.Intro.length-4),Cid:this.addForm.Cid[0]},Attrs:attrs}
      console.log(postList)
      let res = await axios.post(`http://192.168.2.144:8001/api/milktea/`,postList)
      if(res.data.isSucceed){
        this.$router.back()
        return this.$message.success('添加奶茶成功！')
      }
      this.$message.error('该奶茶已经存在！')
    }
  },
  computed: {
    cateId() {
      if (this.addForm.Cid.length === 1) {
        //商品类别id
        return this.addForm.Cid
      }
      return null
    }
  }
}
</script>

<style lang="less" scoped>
.el-step__title {
  font-size: 13px;
}

.el-checkbox {
  margin: 0 10px 0 0 !important;
}

.previewImg {
  width: 100%;
}

.btnAdd {
  margin-top: 15px;
}
</style>
