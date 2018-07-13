'use strict';
var app = getApp();
var { Common } = require('../../../utils/common');
var { util } = require('../../../utils/util');
var Setting = new Common();
Setting.expend({
  /**
   * 页面的初始数据
   */
  data: {
    isNotify: util.isNotify,
    isHideBackTop:true
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    wx.setNavigationBarTitle({
      title: '设置'
    });
    wx.hideShareMenu();
    this.data.isNotify !== util.isNotify && this.setData({
      isNotify: util.isNotify
    })
  },
  switch1Change(e) {
    var val = e.detail.value;
    var status;
    util.setStorageSync('isNotify', val);
    util.isNotify = val;
    if (!val) {
      status = '关';
      util.request({
        url: '/List/ClosePush',
        data: {
          userID: app.userInfo.userID
        }
      }).then(res => {
        util.msg('关闭成功');
      })
    } else {
      util.msg('开启成功');
      status = '开';
      util.collectCount = 0;
      util.setStorage({
        key: "count",
        data: 0
      });
      util.setStorage({
        key: "date",
        data: ''
      });
    }
    wx.reportAnalytics('push', {
      status: status,
    });
  },
  toggleCopy() {
    util.toggleCopyFlag = !util.toggleCopyFlag * 1;
    if (util.toggleCopyFlag) {
      util.show('已开启分享复制地址,分享后会自动复制地址到剪贴板')
    } else {
      util.show('已关闭分享复制地址')
    }
    util.setStorage({
      key: "toggleCopyFlag",
      data: util.toggleCopyFlag
    })
  },
  gameTest() {
    wx.navigateTo({
      url: '/pages/web/web?url=' + encodeURIComponent('https://h5.gao7.com/start/10095')
    })
  },
  back(){
    wx.navigateBack()
  }
});

Page(Setting)
// https://res.qszhg.6hgame.com/gao7/?GameID=10095&Token=061B5FB6DEE86C7B5FAF0BF37E090F0A&MemberID=2958726606934120685&SignatureStamp=1524219906&SignatureMD5=CE53BD40EC36DFF6DC6BBAB1B0E2F73F