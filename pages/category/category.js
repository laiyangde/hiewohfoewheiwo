'use strict';
var app = getApp();
var { Basic } = require('../../utils/basic');
var { util } = require('../../utils/util');
var Category = new Basic();
Category.__init({
  interfaceName: 'list/Categorys',
  title: '分类',
  dataName: 'Categorys',
  data: {
    currentIndex: 0,
    adObj:{}
  },
  onLoad(options) {
    if (getCurrentPages().length === 1) {
      this.setData({
        isShareEntry: !0
      })
    }
    if (options && options.currentIndex){
      this.setData({ currentIndex: options.currentIndex})
    }
    this.__setTitle();
    this.__getData();
    util.ad.then(res => {
      if (res['10003']){
        var adObj = res['10003'];
        // adObj.adList = adObj.adList.concat(adObj.adList)
        this.setData({
          adObj
        })
      }
    })
  },
  __addShare(obj) {
    obj.path = this.route + '?currentIndex=' + this.data.currentIndex
  },
  __getParam() {
    return {}
  },
  __success(res) {
    var __data = res.Data;
    this.setData({
      Categorys: __data.DataList
    })
    this.isLoading = !1;
    util.setStorage({
      key: 'categoryData',
      data: __data.DataList.filter(item => {
        var b = !(item.CategoryID === 133 || item.CategoryID === 102);
        if (b) {
          delete item.Count;
          delete item.Image;
          item.SubArray = item.SubArray.slice(1).map(item => {
            return {
              SubID: item.SubID,
              SubName: item.SubName,
            }
          })
        }
        return b;
      }),
    })
  },
  navSwitch: function (e) {
    this.setData({
      currentIndex: e.currentTarget.dataset.index,
    })
  },
  categoryDetail:function(e){
    var { CategoryID, SubArray, CategoryTitle} = this.data.Categorys[this.data.currentIndex];

    var subItem = SubArray[e.currentTarget.dataset.index];
    var { SubName: label, SubID, BigImgUrl } = subItem;
    if (CategoryID == 133){//跳转INOTCH
      var param = SubID == 0 ? {} : {
          StyleID: SubID,
          StyleName: label,
          CategoryID: subItem.CategoryID,
          StyleImg: BigImgUrl
      };
      util.toINOTCH(null, param)
      return;
    }
    if (CategoryID == 102){//跳转表情小程序
      util.toMiniProgram('wxb66c141ee02a4eb4', 'pages/category/category?index=0&ID=' + SubID)
      return;
    }

    wx.navigateTo({
      url: '../categoryList/categoryList?categoryId=' + CategoryID + '&label=' + label + '&title=' + CategoryTitle
    })
  },
  onReady(){}
});

Page(Category);






