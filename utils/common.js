'use strict'
var { util } = require('util');
var app = getApp();

function Common() {
  this.data = {
    isGetFormId: util.isGetFormId,//是否提交formid
    isLogin: !1,//是否登陆 
    model: util.supperClass,
    // isIphoneX: util.isIphoneX,
    android: util.platform === 'android',
    suspensionInfo:{//悬浮开启关闭信息
        ad:true,//是否显示广告
        isShareEntry: false,//是否分享链接
        netWork: !0,//是否有网络
        title:'精彩话题',
        isNavBack:true,//导航是否有返回按钮
        statusBarHeight: util.statusBarHeight
    },
    suspensionAd:{}//悬浮窗广告
  }
  this.title = '精选';//页面标题
  this.isLoading = !1;//是否正在加载
  this.isNeedUserID = !1;//页面是否需要登录
}
Common.prototype = {
  onLoad(options) {
    if (this.data.isGetFormId !== util.isGetFormId){
      this.setData({
        isGetFormId: util.isGetFormId
      })
    }
    if (this.isNeedUserID) {
      if (app.userInfo.userID) return this.customOnLoad(options);
      app.loginPromise.then(() => {
        // app.loginPromise = null;
        return this.onLoad(options);
      }).catch(() => {
        if (app.loginCount <= 6) {
          this.onLoad(options)
        }
      })
    } else {
      // if (app.userInfo.userID && app.loginPromise) app.loginPromise = null;
      this.customOnLoad(options);
    }
  },
  customOnLoad(options){
    this.onLoaded(options);
  },
  // constructor: Common,
  //登陆
  login(e) {
    if (this.isLoading) return;
    this.isLoading = !0;
    if (e.detail.errMsg === 'getUserInfo:fail auth deny') {
      this.isLoading = !1
      return util.msg('您拒绝了登录！', 1);
    }
    if(!app.userInfo.userID){
      this.isLoading = !1
      return app.loginPromise.then(res=>{
        return this.login(e)
      })
    }
    wx.showLoading({ title: '正在登录...' });
    app.sendUserInfo(e.detail.userInfo).then((userInfo) => {
      this.isLoading = !1;
      var callback = e.currentTarget.dataset.callback.split('.');
      if (callback[1] === 'auto') {
        this.setData({
          isLogin: !0
        })
      }
      this.__emit(callback[0], e);
      wx.hideLoading();
    }).catch((e) => {
      wx.hideLoading();
      util.msg('登录失败', 1)
      this.isLoading = !1
    })
  },
  login2(e){
    if (app.isLogin()){
      var callback = e.currentTarget.dataset.callback.split('.');
      return this.__emit(callback[0], e);
    }else{
      return this.login(e);
    }
  },

  /**
  *form的Submit事件,用于提交formid,并触发对应的button事件
  *@param e  事件对象
  **/
  formSubmit(e) {
  // console.log(89676)
  //   return;
    e.currentTarget = e.detail.target;
    var eventName = e.currentTarget.dataset.event;
    this.__emit(eventName, e);
    // if (!util.isNotify) return;
    return e.detail.formId && this.__dealWithFormId(e.detail.formId)
  },
  /**
  * 跳转到页面
  *@param e 事件对象  包含需要跳转的页面data-page  及 data-参数
  ?a=1&b=1
  **/
  toPage(e) {
    var { event, page, ...param } = e.currentTarget.dataset;
    var url = '';
    var suffixUrl='/pages/';
    for (var key in param) {
      url += `&${key}=${param[key]}`
    }
    if ('setting,intro,taste,address,officeNotes'.indexOf(page)>-1){
      suffixUrl = '/packageC/pages/'
    } else if ('userHome,pureListPage,message,collectList,downloadList,rewardList,myPublish,upload,uploadList'.indexOf(page) > -1){
      suffixUrl = '/packageB/pages/'
    } else if ('commentList,web,categoryList,preview'.indexOf(page) === -1){
      suffixUrl = '/packageA/pages/'
    }
    url = url ? `${page}/${page}?${url.slice(1)}` : `${page}/${page}`
    wx.navigateTo({
      url: suffixUrl+url
    })
  },

  /**设置顶部标题**/
  __setTitle(title) {
    // wx.setNavigationBarTitle({
    //   title: this.title
    // });
    this.setData({
      ['suspensionInfo.title']: title || this.title
    })
  },
  /**
  *调用回调函数
  *@param name 函数名
  *@param params 函数参数
  **/
  __emit(name, ...params) {
    return this[name] && this[name].apply(this, params);
  },

  /**
  *提交formid
  *@param e  事件对象
  **/
  __dealWithFormId(formId) {
    if (!app.userInfo.userID || formId === 'the formId is a mock one') return;
   var dayLimit = util.dayLimit('formID');
   if (dayLimit.isExceed) {
      dayLimit.destroy();
      dayLimit = null;
      util.isGetFormId = false;
      return this.setData({
        isGetFormId: false
      })
    }
    util.request({
      url: 'list/pushreport',
      data: {
        userID: app.userInfo.userID,
        code: formId
      }
    }).then((res) => {
      dayLimit.currentCount++;
      dayLimit = null;
    }).catch((e) => {
      console.log('错误', e)
    })
  },
  __deepAssign: util.deepAssign,
  expend(...sources) {
    sources.forEach((source) => {
      this.__deepAssign(this, source);
    })
  },
  back(){
    wx.navigateBack({
      delta: 1,
    });
  },
  entryIndexHandle(){
    wx.switchTab({
      url: '/pages/index/index'
    })
  },
  adJump(e){
    var { jumptype, jumpurl, appid, adid } = e.currentTarget.dataset;
    if (jumptype === 1){
      wx.navigateTo({
        url: '/pages/web/web?url=' + jumpurl
      })
      return;
    }
    if (jumptype === 3){
      wx.navigateTo({
        url: jumpurl
      })
      return;
    }
    if (jumptype === 4) {
      wx.reportAnalytics('to', {adid});
      util.request({ url: 'List/AddStatistics', data: { adID: adid, userID:app.userInfo.userID}});
      return util.toMiniProgram(appid, jumpurl)
    }
    if (jumptype === 5) {

    }
  },
  closeSuspensionAd(){
    this.setData({
      'suspensionInfo.ad':false
    })
  },
  onReady(){
    util.ad.then(res => {
      if (res['10002']){
        var { SwitchTime, adList } = res['10002'];
        var pageName = this.route.split('/').reverse()[0];
        var suspensionAd = { SwitchTime };
        var obj = {}
        // suspensionAd.adList = adList;
        suspensionAd.adList = adList.filter(item => {
          return item.PublishPage.indexOf(pageName) > -1
        })
        if (suspensionAd.adList.length > 0) {
          obj.suspensionAd = suspensionAd
          this.setData(obj)
        }
      }
    })
  }
}
module.exports.Common = Common;