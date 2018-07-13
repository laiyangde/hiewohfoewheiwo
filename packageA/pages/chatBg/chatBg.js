'use strict';
var app = getApp();
var { Basic } = require('../../../utils/basic');
var { util } = require('../../../utils/util');
var ChatBg = new Basic();
ChatBg.__init({
  interfaceName: 'list/background',
  title: '聊天背景',
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || []));
    if (obj.dataList.length < 4) {
      obj.LoadingText = obj.dataList.length === 0 ? '暂无壁纸!' : '';
    }
    this.__reSetData(obj);
  },
  preview(e) {
    var index = e.currentTarget.dataset.index;
    util.page = this;
    wx.navigateTo({
      url: '/pages/preview/preview?index=' + index + '&suffix=' + (this.suffix || 'bz')
    })
  },
});

Page(ChatBg);