'use strict';
var app = getApp();
var { Basic } = require('basic');
var { util } = require('util');

module.exports.MultiList = {
  data: {
    navArr: [],
    currentIndex: 0,
    scrollLeft: 0,
    template: '',
    isShowNavView:false
  },
  __init(options = {}) {
    ({ dataName: this.dataName = 'baseData', index: this.index = 0, exclude: this.exclude = ',' } = options);
    this.__createRelativesByName(this.dataName, options.count || 1, options.everyCount);
    this.__deepAssign(this, options);
  },
  onLoaded(options) {
    this.__emit('onLoadBefore', options);
    this.__addProperties();
    this.__getRelative();
    this.__setTitle();
    if(this.index == 0){
      this.__loadedMore().then(this.getLazyInfo || (() => { }));
    }else{
      this.setData({
        currentIndex: this.index
      })
    }
    this.__emit('onLoadAfter', options);
  },
  change: function (e) {
    var obj = {};
    var currentIndex = e.detail.current;
    this.index = currentIndex;
    this.__getRelative();
    util.abort();
    this.__emit('changeBefore', currentIndex, obj);
    obj.currentIndex = currentIndex;
    obj.isHideBackTop = this.isHideBackTop;
    if (this.positionArr) {
      obj.scrollLeft = this.positionArr[currentIndex];
    }
    this.setData(obj);
    if (this.dataList.length === 0) {
      this.scrollTop = 0;
      this.__loadedMore();
    }
  },
  navSwitch: function (e) {
    var obj = {
      currentIndex: e.currentTarget.dataset.index,
    }
    if (this.data.isShowNavView){
      obj.isShowNavView = false;
    }
    this.setData(obj);
  },
  toggleNavView(){
    this.setData({
      isShowNavView: !this.data.isShowNavView
    })
  },
  initNav(navArr,obj={}){
    obj.navArr = navArr;
    this.__createRelativesByName(this.dataName, obj.navArr.length - 1);
    obj[this.dataName] = this.data[this.dataName];
    this.__reSetData(obj);
    return util.getRectsLoop('.nav-text').then(res => {
      var positionArr = [];
      res.forEach((item, index) => {
        positionArr.push(item.left + (item.width - util.windowWidth >> 1))
      });
      this.positionArr = positionArr;
    });
  }
}