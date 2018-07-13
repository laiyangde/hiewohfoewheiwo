'use strict';
var app = getApp();
var { Common } = require('common');
var { util } = require('util');
function Basic() {
  Common.call(this);
  /** 动态数据**/
  Object.assign(this.data, {
    isHideBackTop: !0,//是否隐藏返回顶部按钮
    // netWork: !0,//是否有网络
    isCrossThreshold: false,//是否到达可跟随导航处
  });
  
  this.threshold = 10000;//跟随导航的位置
  this.scrollTop = 0;//滚动位置
  this.exclude = ',';//如果为空，当前页面的所有列表使用相同的sectionPoistion，通过添加列表的索引，这些列表将使用不同的sectionPoistion
}
Basic.prototype = Object.create(Common.prototype);
Object.assign(Basic.prototype, {
  onShareAppMessage(e) {
    var obj = util.share();
    obj.path = this.route;
    this.__emit('__addShare', obj, e);
    console.log('转发', obj.path)
    this.copySharelink(obj.path);
    return obj;
  },
  copySharelink(link){
    if (util.toggleCopyFlag) {
      wx.setClipboardData({
        data: link,
      })
    }
  },
  onLoaded(options) {
    if (getCurrentPages().length === 1) {
      this.setData({
        'suspensionInfo.isShareEntry': !0
      })
    }
    this.__emit('onLoadBefore', options);
    this.__addProperties();
    this.__getRelative();
    this.__setTitle();
    this.__loadedMore().then(this.getLazyInfo || (()=>{}));
    this.__emit('onLoadAfter', options);
  },

  onShow() {
    // console.log(this.data.baseData)
  },
  onReachBottom_(e) {
    console.log(777)
    
    if (this.isLoading) {
      return;
    }
    if (!this.hasNext) {
      return;
    }
    if (this.LoadingText !== util.LoadingText) {
      this.__reSetData({
        LoadingText: util.LoadingText,
      })
    }

    console.log(777)
    this.__loadedMore();
  },
  onPageScroll_(e){
    this.scrollTop = e.detail.scrollTop;
    this.scrollThrottle(e);
  },
  scrollThrottle: util.throttle(function (e) {
    var { deltaY, scrollTop, scrollHeight } = e.detail,obj={};
    var _isHideBackTop = scrollTop < 1800;
    if (this.getThreshold){
      var _isCrossThreshold = scrollTop >= this.threshold;
      if (_isCrossThreshold !== this.data.isCrossThreshold) {
        obj.isCrossThreshold = _isCrossThreshold;
      }
    }
    if (_isHideBackTop !== this.data.isHideBackTop) {
      obj.isHideBackTop = _isHideBackTop;
      this.isHideBackTop = _isHideBackTop;
      this.__emit('backTopChange', _isHideBackTop)
    }
    this.switchSection();

    if (!util.isEmpty(obj)) {
      this.__reSetData(obj);
    }
  }, 200, { leading: false }),
  switchSection(){
    // sectionPoistion: [],//每个模块的位置
    //   sectionIndex:0,//当前在哪个模块
    var sectionIndex = this.sectionIndex;
    var sectionPos = this.sectionPoistion[sectionIndex];
    var scrollTop = this.scrollTop;
    if (scrollTop > sectionPos){
      for (var i = sectionIndex+1; i < this.sectionPoistion.length;i++){
        if (this.sectionPoistion[i] > scrollTop){
          break;
        }else{
          sectionIndex++;
        }
      }
    }else{
      sectionIndex--;
      for (var i = sectionIndex; i >=0; i--) {
        if (this.sectionPoistion[i] < scrollTop) {
          break;
        } else {
          sectionIndex--;
        }
      }
      if (sectionIndex < 0) sectionIndex=0;
    }
    if (this.sectionIndex !== sectionIndex){
      this.sectionIndex = sectionIndex;
      this.__reSetData({
        paddingTop: this.sectionPoistion[sectionIndex - 1 > 0 ? sectionIndex - 1 : 0] - this.sectionPoistion[0],
        beforeIndex: (sectionIndex - 1) * this.every,
        afterIndex: (sectionIndex + 2) * this.every
      })
    }
  },
  /*===========================================================================================*/
  // toUserHome(e) {
  //   wx.navigateTo({
  //     url: '../userHome/userHome?userId=' + e.currentTarget.dataset.userid
  //   })
  // },
  // preview(e) {
  //   var index = e.currentTarget.dataset.index;
  //   var { hasNext, pageIndex,pageSize } = this.staticRelative;
  //   var params = this.__getParam();
  //   var dataList = this.dataList;
    
  //   delete params.pageindex;
  //   delete params.pagesize;
  //   if (dataList.length === 0) return;
  //   util.relative = {
  //     interfaceName: this.interfaceName,
  //     baseData: { hasNext, pageIndex, filterStr: '', pageSize },
  //     dataList: dataList.slice(index),
  //     params
  //   }
  //   wx.navigateTo({
  //     url: '/pages/preview/preview?index=' + index + '&suffix=' + (this.suffix || 'bz')
  //   })
  // },
  preview(e) {
    var index = e.currentTarget.dataset.index;
    util.page = this;
    wx.navigateTo({
      url: '/pages/preview/preview?index=' + index + '&suffix=' + (this.suffix || 'bz')
    })
  },
  toSearch() {
    wx.navigateTo({
      url: '/packageA/pages/search/search'
    })
  },
  backTop() {
    this.sectionIndex = 0;
    this.__reSetData({
      paddingTop:0,
      beforeIndex: -1 * this.every,
      afterIndex: 2 * this.every,
      scollTop: 0
    })
  },
  /**重试**/
  reTry() {
    var _this = this;
    wx.getNetworkType({
      success: function (res) {
        var obj = {};
        if (res.networkType !== 'none') {
          obj.Error = !1;
          obj.LoadingText = util.LoadingText;
          obj['suspensionInfo.netWork'] = !0;
          _this.__loadedMore();
        } else {
          obj['suspensionInfo.netWork'] = !1;
          util.msg('请检查网络', 1);
        }
        _this.__reSetData(obj);
      }
    })
  },

  /*===========================================================================================*/
  __init(options = {}) {
    if (!options.isNoCreate) {
      ({ dataName: this.dataName = 'baseData', index: this.index = 0, exclude: this.exclude=',' } = options);
      this.__createRelativesByName(this.dataName, options.count,options.everyCount);
    } else {
      delete options.isNoCreate
    }
    this.__deepAssign(this, options);
  },

  __getRelative() {
    var relativeD = this.data[this.dataName];
    var relativeS = this[this.dataName];
    var isArr = Array.isArray(relativeD);
    var obj = {
      dynamicRelative: isArr ? relativeD[this.index] : relativeD,
      staticRelative: isArr ? relativeS[this.index] : relativeS,
      dynamicKey: isArr ? this.dataName + '[' + this.index + '].' : this.dataName + '.'
    }
    Object.assign(this, obj);
    return obj;
  },

  /**加载更多**/
  __loadedMore() {
    var p = this.__getData()
    if(p){
      p.then(this.__checkSection);
    }
    return p;
  },
  /**检查模块个数和模块的标志位置个数是否符合**/
  __checkSection(){
    var sectionCount = Math.ceil(this.pageSize * this.pageIndex / this.every);
    if (sectionCount > this.sectionPoistion.length) {
      this.__getSectionPosition();
    }
  },
  /**获取模块的标志位置**/
  __getSectionPosition(){
    var listIndex = this.index;
    util.getRectsLoop('.benchmark' + listIndex).then(res=>{
      if (listIndex !== this.index) return;//如果在获取过程中，切换了列表，则不更新标志位置,所以切换列表是还需要重新检查
      var len = this.sectionPoistion.length,last = -1000,top=0,arr=[];
      if (len) last = this.sectionPoistion[len-1];
      len = res.length - 1;
      while(len >= 0){
        top = res[len].top + this.scrollTop;
        if (top - last < 500){
          break;
        }
        arr.unshift(top);
        len--;
      }
      this.sectionPoistion.push(...arr);
      console.log(this.sectionPoistion)
    })
  },
  /**
  *创建数据列表相关的属性
  @param name 属性对象key
  @param length 如果有name是一个属性对象数组集合，否则name是一个属性对象
  **/
  __createRelativesByName(name, count,every=48) {
    var dynamics = {
      dataList: [],
      LoadingText: util.LoadingText,
      Error: !1,
      scollTop: 0,
      paddingTop:0,//列表按模块处理  当到达n模块时   占用n-2模块的位置，
      beforeIndex: -every,//显示范围
      afterIndex: every*2,
      every,//每48个为一个模块
      listIndex:0//当前列表索引
    };
    var statics = {
      hasNext: !0,
      pageIndex: 0,
      filterStr: '',
      isHideBackTop: !0,
      subNavIndex:0,
      sectionPoistion:[],//每个模块的位置
      sectionIndex:0,//当前在哪个模块
    }
    if (count) {
      if (!this.data[name]) {
        this.data[name] = [];
        this[name] = [];
      } else if (this.exclude.indexOf(',0,') === -1){//在0列表需要使用同模块标志位置时，就已0作为模板
        statics.sectionPoistion = this[name][0].sectionPoistion
      }
      var len = this.data[name].length;
      // console.log(this, len, count)
      while (count !== 0) {
        var _dynamics = Object.assign({}, dynamics);
        _dynamics.listIndex = len;
        this.data[name].push(_dynamics);
        var _statics = Object.assign({}, statics);
        if (this.exclude.indexOf(',' + len + ',') > -1) {//参考上面exclude属性介绍
          _statics.sectionPoistion = [];
        }
        this[name].push(_statics);
        count--;
        len++;
      }
    } else {
      this.data[name] = dynamics;
      this[name] = statics;
    }
  },
  /**
  *重写setData,相同性质属性不同接口调用一致
  *比如需要改变LoadingText
  **/
  __reSetData(obj) {

    for (var key in obj) {
      if (',dataList,LoadingText,Error,scollTop,beforeIndex,afterIndex,paddingTop,'.indexOf(','+key+',') > -1 || key.indexOf('dataList') > -1) {
        obj[this.dynamicKey + key] = obj[key];
        delete obj[key];
      }
    }
    this.setData(obj);
  },
  /**获取ajax参数**/
  __getParam() {
    var _data = {
      pageindex: this.pageIndex,
      pagesize: this.pageSize || this.needPageSize || 30
    };
    return this.__emit('__supplementParam', _data) || _data;
  },
  __getData() {
    if (this.isLoading) return;
    this.isLoading = !0;
    return util.request({ data: this.__getParam(), url: this.interfaceName })
      .then(this.__success)
      .catch(this.__fail);
  },
  /**
  *获取数据成功后回调
  *@param res 获取的数据
  **/
  __success(res) {
    var __data = res.Data;
    var obj = {};
    this.isLoading = !1;
    this.hasNext = __data === null ? !0 : (__data.hasNext || __data.HasNext);
    this.pageIndex++;
    if (this.Error){
      obj.Error = !1
    }
    if (!this.hasNext) {
      obj.LoadingText = util.NoMoreDataText
    }
    return this.__emit('__dealWithData', __data, obj);
  },
  /**获取数据调用失败回调**/
  __fail(e) {
    console.log(e)
    wx.stopPullDownRefresh && wx.stopPullDownRefresh();
    var _this = this;
    this.isLoading = !1;
    if (e.errMsg.indexOf('createRequestTask:fail:interrupted') > -1) {
      return this.__loadedMore();
    }
    if (e.errMsg.indexOf('fail ssl') > -1 || e.errMsg ==="request:fail abort") return;
    wx.getNetworkType({
      success: function (res) {
        if (res.networkType === 'none') {
          _this.setData({
            'suspensionInfo.netWork': !1,
          });
        } else {
          _this.__reSetData({
            Error: !0,
            LoadingText: util.ErrorText
          })
          console.log('发生错误:', e.toString() === '[object Object]' ? e.errMsg : e)
          // util.showErrorModal(e.toString() === '[object Object]' ? e.errMsg : e);
        }
      }
    })
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || []));
    if (obj.dataList.length < 16) {
      obj.LoadingText = obj.dataList.length === 0 ? '暂无壁纸!' : '';
    }
    this.__reSetData(obj);
  },

  __checkBuyAddData(data,listName,threshold = 0){
    var reward = util.toggle('rewardStr');
    var noBuy,obj = {};
    data.forEach((item,index)=>{
      if (item.PriceType){
        noBuy = !reward.has(item.PicInfoID)
        if (item.noBuy !== noBuy) {
          obj[`${listName}[${threshold + index}].noBuy`] = noBuy;

        }
      }
    })
    return obj;
  },

  /**过滤相同数据**/
  __filterTheSame(filterData, checkBuy = false) {
    var str = this.filterStr, reward;
    if (checkBuy){
      reward = util.toggle('rewardStr');
    }
    var newData = filterData.filter(filterItem => {
      var id = this.getFilterId(filterItem);
      var b = str.indexOf(id) === -1;
      if (b) {
        str += id + ';';
        if (checkBuy && filterItem.PriceType && !reward.has(id)) {
          filterItem.noBuy = !0
        }
      }
      return b;
    })
    this.filterStr = str;
    return newData;
  },

  getFilterId(filterItem) {
    return filterItem.PicInfoID || filterItem.AlbumID || filterItem.CategoryID || filterItem.ID
  },

  /**
    *设置相关属性
  **/
  __addProperties() {
    Object.defineProperties(this, {
      pageIndex: {
        set: function (value) {
          this.staticRelative.pageIndex = value;
        },
        get: function () {
          return this.staticRelative.pageIndex;
        },
        enumerable: true
      },
      pageSize: {
        set: function (value) {
          this.needPageSize = value;
        },
        get: function () {
          return this.needPageSize || 30
        },
        enumerable: true
      },
      hasNext: {
        set: function (value) {
          this.staticRelative.hasNext = value;
        },
        get: function () {
          return this.staticRelative.hasNext;
        },
        enumerable: true
      },
      filterStr: {
        set: function (value) {
          this.staticRelative.filterStr = value;
        },
        get: function () {
          return this.staticRelative.filterStr;
        },
        enumerable: true
      },
      isHideBackTop: {
        set: function (value) {
          this.staticRelative.isHideBackTop = value;
        },
        get: function () {
          return this.staticRelative.isHideBackTop;
        },
        enumerable: true
      },
      dataList: {
        set: function (value) {
          this.dynamicRelative.dataList = value;
        },
        get: function () {
          return this.dynamicRelative.dataList;
        },
        enumerable: true
      },
      every: {
        set: function (value) {
          this.dynamicRelative.every = value;
        },
        get: function () {
          return this.dynamicRelative.every;
        },
        enumerable: true
      },
      subNavIndex: {
        set: function (value) {
          this.staticRelative.subNavIndex = value;
        },
        get: function () {
          return this.staticRelative.subNavIndex;
        },
        enumerable: true
      },
      sectionIndex: {
        set: function (value) {
          this.staticRelative.sectionIndex = value;
        },
        get: function () {
          return this.staticRelative.sectionIndex;
        },
        enumerable: true
      },
      sectionPoistion: {
        set: function (value) {
          this.staticRelative.sectionPoistion = value;
        },
        get: function () {
          return this.staticRelative.sectionPoistion;
        },
        enumerable: true
      },
      LoadingText: {
        // set: function (value) {
        // },
        get: function () {
          return this.dynamicRelative.LoadingText;
        },
        enumerable: true
      },
      Error: {
        // set: function (value) {
        // },
        get: function () {
          return this.dynamicRelative.Error;
        },
        enumerable: true
      },
    });
  },
});

module.exports.Basic = Basic;