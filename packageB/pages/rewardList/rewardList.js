'use strict';
var app = getApp();
var { Basic } = require('../../../utils/basic');
var { util } = require('../../../utils/util');
var Reward = new Basic();
Reward.__init({
  interfaceName: 'list/myoriginallist',
  title: '原创专栏',
  isNeedUserID:!0,
  onLoadBefore: function (options) {
    wx.hideShareMenu();
  },
  __supplementParam(obj) {
    obj.userID = app.userInfo.userID;
  },

  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || []));
    if (obj.dataList.length < 9) {
      obj.LoadingText = obj.dataList.length === 0 ? '您还未赞赏！' : '';
    }
    this.__reSetData(obj);
  },
  oriWallPaperPreview(e) {
    this.idx = e.currentTarget.dataset.index;
    this.preview(e);
  },
});

Page(Reward);