<template>
  <div>
    <el-breadcrumb separator-class="el-icon-arrow-right">
      <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
      <el-breadcrumb-item>店铺管理</el-breadcrumb-item>
      <el-breadcrumb-item>店铺列表</el-breadcrumb-item>
    </el-breadcrumb>
      <el-card>
              <div class="container">
        <div class="search-box">
            <el-button @click="submitAddress" type="success">确认店铺位置</el-button>
            <div class="tip-box" id="searchTip"></div>
        </div>
        <el-amap class="amap-box"
                 :amap-manager="amapManager"
                 :vid="'amap-vue'"
                 :zoom="zoom"
                 :plugin="plugin"
                 :center="center"
                 :events="events"
        >
            <!-- 标记 -->
            <el-amap-marker v-for="(marker, index) in markers" :position="marker" :key="index"></el-amap-marker>
        </el-amap>
    </div>
    <el-row>
        <el-col :span="12" style="margin-top:30px">
                      <el-form
        :model="shopForm"
        label-width="70px"
      >
        <el-form-item label="店铺名">
          <el-input v-model="shopForm.Name"></el-input>
        </el-form-item>
        <el-form-item label="店铺地址">
          <el-input v-model="shopForm.Address"></el-input>
        </el-form-item>
      </el-form>
    <el-button
        type="primary"
        @click="toAdd"
    >确认添加</el-button>
        </el-col>
    </el-row>
      </el-card>
  </div>
</template>

<script>
    import axios from 'axios'
    import {AMapManager, lazyAMapApiLoaderInstance} from 'vue-amap'
    let amapManager = new AMapManager()
    export default {
        data() {
            let self = this
            return {
                //店铺信息
                shopForm:{
                    Address:'',
                    Name:'',
                    Lat:'',
                    Lng:'',
                    BeginTime:'',
                    EndTime:''
                },
                address: null,
                searchKey: '',
                amapManager,
                markers: [],
                searchOption: {
                    city: '洛阳',
                    citylimit: true
                },
                center: [121.329402, 31.228667],
                zoom: 17,
                lng: 0,
                lat: 0,
                loaded: false,
                markerEvent:{
                    click(e){
                        console.log('点击',e);
                    }
                },
                events: {
                    init() {
                        lazyAMapApiLoaderInstance.load().then(() => {
                            self.initSearch()
                        })
                    },
                    // 点击获取地址的数据
                    // lng精度
                    // lat维度
                    click(e) {
                        self.markers = []
                        let {lng, lat} = e.lnglat
                        self.lng = lng
                        self.lat = lat
                        console.log(e)
                        self.center = [lng, lat]
                        self.markers.push([lng, lat])
                        // 这里通过高德 SDK 完成。
                        let geocoder = new AMap.Geocoder({
                            radius: 1000,
                            extensions: 'all'
                        })
                        geocoder.getAddress([lng, lat], function (status, result) {
                            if (status === 'complete' && result.info === 'OK') {
                                if (result && result.regeocode) {
                                    console.log(result.regeocode.formattedAddress)
                                    self.address = result.regeocode.formattedAddress
                                    self.searchKey = result.regeocode.formattedAddress
                                    self.$nextTick()
                                }
                            }
                        })
                    }
                },
                // 一些工具插件
                plugin: [
                    {
                        // 定位
                        pName: 'Geolocation',
                        events: {
                            init(o) {
                                // o是高德地图定位插件实例
                                o.getCurrentPosition((status, result) => {
                                    if (result && result.position) {
                                        // 设置经度
                                        self.lng = result.position.lng
                                        // 设置维度
                                        self.lat = result.position.lat
                                        // 设置坐标
                                        self.center = [self.lng, self.lat]
                                        self.markers.push([self.lng, self.lat])
                                        // load
                                        self.loaded = true
                                        // 页面渲染好后
                                        self.$nextTick()
                                    }
                                })
                            },
                            click(e){
                                console.log(e);
                            }
                        }
                    },
                    {
                        // 工具栏
                        pName: 'ToolBar',
                        events: {
                            init(instance) {
                                console.log(instance);
                            }
                        }
                    },
                    {
                        // 鹰眼
                        pName: 'OverView',
                        events: {
                            init(instance) {
                                console.log(instance);
                            }
                        }
                    },
                    {
                        // 地图类型
                        pName: 'MapType',
                        defaultType: 0,
                        events: {
                            init(instance) {
                                console.log(instance);
                            }
                        }
                    },
                    {
                        // 搜索
                        pName: 'PlaceSearch',
                        events: {
                            init(instance) {
                                console.log(instance)
                            }
                        }
                    }
                ]
            }
        },
        methods: {
            //提交店铺
            async toAdd(){
                console.log(this.shopForm)
                const { data: res } = await this.$http.post(`Businesses/`,this.shopForm)
                console.log(res)
                if (!res.isSucceed) {
                    return this.$message.error('添加失败')
                }
                this.$message.success('添加成功')
                this.$router.back()
            },
            submitAddress(){
                console.log('经纬度',this.center)
                console.log('地址',this.address)
                this.shopForm.Address = this.address
                this.shopForm.Lng = this.center[0]
                this.shopForm.Lat = this.center[1]
                this.shopForm.BeginTime='10:00:00'
                this.shopForm.EndTime='21:30:00'
            },
            initSearch() {
                let vm = this
                let map = this.amapManager.getMap()
                AMapUI.loadUI(['misc/PoiPicker'], function (PoiPicker) {
                    var poiPicker = new PoiPicker({
                        input: 'search',
                        placeSearchOptions: {
                            map: map,
                            pageSize: 10
                        },
                        suggestContainer: 'searchTip',
                        searchResultsContainer: 'searchTip'
                    })
                    vm.poiPicker = poiPicker
                    // 监听poi选中信息
                    poiPicker.on('poiPicked', function (poiResult) {
                        // console.log(poiResult)
                        let source = poiResult.source
                        let poi = poiResult.item
                        if (source !== 'search') {
                            poiPicker.searchByKeyword(poi.name)
                        } else {
                            poiPicker.clearSearchResults()
                            vm.markers = []
                            let lng = poi.location.lng
                            let lat = poi.location.lat
                            let address = poi.cityname + poi.adname + poi.name
                            vm.center = [lng, lat]
                            console.log(vm.center)
                            vm.markers.push([lng, lat])
                            vm.lng = lng
                            vm.lat = lat
                            vm.address = address
                            vm.searchKey = address
                        }
                    })
                })
            },
            searchByHand() {
                if (this.searchKey !== '') {
                    this.poiPicker.searchByKeyword(this.searchKey)
                }
            }
        }
    }
</script>

<style lang="less" scoped>
    .container {
        width:100%;
        height: 500px;
        position: relative;
        border: 1px solid #999;
    }

    .search-box {
        position: absolute;
        z-index: 5;
        width: 70%;
        left: 13%;
        top: 10px;
        height: 30px;
    }

    .search-box input {
        float: left;
        width: 59%;
        height: 100%;
        font-size:13px;
        border: 2px solid #30ccc1;
        padding: 0 8px;
        outline: none;
    }

    .search-box button {
        float: left;
        margin-left:5px;
        /* width: 20%;
        height: 100%;
        background: #30ccc1;
        border: 1px solid #30ccc1;
        color: #fff;
        outline: none; */
    }

    .tip-box {
        width: 100%;
        max-height: 260px;
        position: absolute;
        top: 30px;
        overflow-y: auto;
        background-color: #fff;
    }
</style>