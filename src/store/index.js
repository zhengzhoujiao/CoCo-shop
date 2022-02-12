import Vue from 'vue'
import Vuex from 'vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    //当前店铺名
    shopName:''
  },
  getters:{
    getTheName(state){
      return state.shopName
    }
  },
  mutations: {
    getName(state,name){
      state.shopName = name
    }
  },
  actions: {
  },
  modules: {
  }
})
