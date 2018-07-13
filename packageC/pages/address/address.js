// pages/address/address.js
var { util } = require('../../../utils/util');
var app = getApp();
Page({

  /**
   * 页面的初始数据
   */
  data: {
    
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    this.topicID = options.topicid;
    var address = util.getStorageSync('address');
    if (address){
      this.setData(address);
    }
    wx.hideShareMenu();
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
  
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
  
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
  
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {
  
  },
  formSubmit(e){
    var { realName, address, tel,weixin} = e.detail.value;
    if (realName.trim() === ""){
      return util.msg('姓名不能为空!',1)
    }
    if(!tel.trim().match(/^1{1}\d{10}$/)){
      return util.msg('手机号格式错误!', 1)
    }
    if(!weixin.trim().match(/^[-_a-z0-9]{5,20}$/i)){
      return util.msg('微信号格式错误!', 1)
    }
    if (address.trim()===""){
      return util.msg('地址不能为空!', 1)
    }
    var data = {
      "topicID": this.topicID,
      "name": realName,
      "phone": tel,
      "weChat": weixin,
      "address": address,
      "userID": app.userInfo.userID
    }
    util.request({ url:'List/FillInWinningInfo',data}).then(res=>{
      if (res.ResultCode === '0'){
          util.msg('保存成功!');
          var pages = getCurrentPages();
          if (pages.length > 1 && pages[pages.length - 1].route.indexOf('address/address')>-1){
            wx.navigateBack()
          }
          util.setStorage({
            key: "address",
            data: e.detail.value
          })
      }else{
        wx.showModal({
          title: '提示',
          content: res.ResultMessage,
          showCancel: false
        });
      }
    }).catch(e=>{
      console.log(e)
    })
    
  }
// / ^[a - zA - Z]{1}[-_a - zA - Z0 - 9]{5,19}$/
})