import Vue from 'vue'
import Vuex from 'vuex'
import vocabulary from './modules/vocabulary'

Vue.use(Vuex)

const debug = process.env.NODE_ENV !== 'production'

export default new Vuex.Store({
  state: {
    settings: { 
      instance: {
        api: ""
      }
    }
  },
  mutations: {
    setInstanceApi (state, api) {
      state.settings.instance.api = api
    },
  },
  modules: {
    vocabulary
  },
  strict: debug
})