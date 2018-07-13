// components/multiFnBtn/multi-fn-btn.js
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    extClass: String, // 简化的定义方式
    extData: {
      type: Array,
      value: [],
    }
  },
  options: {
    multipleSlots: true // 在组件定义时的选项中启用多slot支持
  },
  ready(){
    console.log(this.data.extData,666)
  },
  /**
   * 组件的初始数据
   */
  data: {

  },

  /**
   * 组件的方法列表
   */
  methods: {

  }
})
