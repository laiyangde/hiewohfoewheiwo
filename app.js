'use strict';
const sign = require('utils/sign.js');
const { util } = require('utils/util');
import message from 'utils/message';
require('utils/ald-stat');
// require('utils/ktongji.min');
// ktongji.init("wxd521f27d130179fa");
if (!util.getStorageSync('cleared')){
  try {
    let str = 'aldstat_uuid,page_show_upload,page_load_upload,page_unload_upload,page_hide_upload,app_session_key_create_launch_upload,app_session_key_create_show_upload,app_launch_upload,app_show_upload,app_hide_upload,app_unLaunch_upload,reLoginCount,messageCounts,downloadData-bz,downloadData-tx,downloadData-bq,';
    wx.getStorageInfoSync().keys.forEach(item=>{
      if(str.indexOf(item) === -1){
        wx.removeStorageSync(item)
      }
    })
    util.setStorage({
      key: "cleared",
      data: 'true'
    })
    str = '';
  } catch (e) {
  }
}
App({
  onLaunch: function (options) {
    console.log(options)
    this.loginCount = 0;
    this.userInfo = {};
    if (options.scene === 1014) {
      wx.reportAnalytics('tpl_enter', {
        app_name: '壁纸精选'
      })
    }
    if (options.query.from) {
      wx.reportAnalytics("from", {
        "from": options.query.from,
        collect_time: '小程序启动',
      });
    }
    if (options.query.gdt_vid) {
      wx.reportAnalytics('ad_enter', {
        collect_time: '小程序启动',
        gdt_vid: options.query.gdt_vid,
        weixinadinfo: options.query.weixinadinfo,
        scene: options.scene
      });
    }
    if ('1020,1035,1043'.indexOf(options.scene) > -1){
      this.source = options.scene;
      this.appID = options.referrerInfo ? options.referrerInfo.appId : '';
      return this.login();
    }
    var userInfo = util.getStorageSync('userInfo');
    if (!userInfo) {
      util.setStorage({
        key: "bz-version",
        data: util.version
      })
      return this.login();
    }
    if (!userInfo.userID) return this.login();
    this.userInfo = userInfo;
    if (util.getStorageSync('bz-version') !== util.version) {
      //需要更新内容提示，在首页里使用
      this.needVersionTip = !0;
      util.setStorage({
        key: "bz-version",
        data: util.version
      })
    }
    this.updateUserInfo();
    util.settingPromise.then((setting) => {//判断是否需要重新登入
      let reLoginCount = util.getStorageSync('reLoginCount') || '0';
      if (setting.AgainLogin != reLoginCount) {
        this.login();
        util.setStorage({
          key: "reLoginCount",
          data: setting.AgainLogin
        })
      }
    })
    
    console.log('用户信息：',userInfo)
  },
  getMessage(){
    message().update(this.userInfo.userID).then(res=>{
      var Dvalue = message().Dvalue;
      if (Dvalue.needBrowerCount){
        // wx.setTabBarBadge({
        //   index: 3,
        //   text: Dvalue.needBrowerCount + ''
        // })
      }
    })
  }
  ,
  onShow(options){
    if (!util.getStorageSync('piazzaPageRed')) {
      wx.showTabBarRedDot({ index: 1 });
    }
    if(options.query.from){
      wx.reportAnalytics("from", {
        "from": options.query.from,
        collect_time: '小程序显示',
      });
    }
    if (options.query.gdt_vid){
      wx.reportAnalytics('ad_enter', {
        collect_time: '小程序显示',
        gdt_vid: options.query.gdt_vid,
        weixinadinfo: options.query.weixinadinfo,
        scene: options.scene
      });
    }
    if(this.userInfo.userID){
      this.getMessage()
    }
  },
  login: function () {
    this.loginPromise = new Promise((resolve, reject) => {
      let currentCount = 0;
      let _this = this;
      function loop() {
        new Promise((rel, rej) => {
          wx.login({
            success: rel,
            fail: rej
          });
        }).then(res => {
          if (res.code) return util.request({
            url: 'list/login',
            data: { code: res.code, appType: util.appType, source: _this.source || '', appID: _this.appID || '' }
          })
          throw res;
        }).then(res => {
          resolve(res);
          resolve = reject = loop = null;
        })
          .catch(e => {
            currentCount++;
            if (currentCount >= 5) {
              reject(e);
            } else {
              loop();
            }
          })
      }
      loop();
    })
    this.loginPromise.then(res => {
      let { UserInfo, AsynData: { CollectIDs, PurchasedWallIDs, AvatarCollectIDs, EmojiCollectIDs, CollectUploadIds } } = res.Data;
      this.userInfo = UserInfo;
      util.setStorage({
        key: "userInfo",
        data: UserInfo
      });
      PurchasedWallIDs && util.toggle('rewardStr').setIds(PurchasedWallIDs);
      CollectIDs && util.toggle('collectStr-bz', CollectIDs).destory();
      AvatarCollectIDs && util.toggle('collectStr-tx', AvatarCollectIDs).destory();
      EmojiCollectIDs && util.toggle('collectStr-bq', EmojiCollectIDs).destory();
      CollectUploadIds && util.toggle('collectStr-sc', CollectUploadIds).destory();

      if (!util.getStorageSync('reLoginCount')) {
        util.settingPromise.then(setting => {
          util.setStorage({
            key: "reLoginCount",
            data: setting.AgainLogin
          })
        })
      }
      this.getMessage()
    })


  },
  sendUserInfo(userInfo) {
    userInfo.userID = this.userInfo.userID; 
    return util.request({ url: 'list/UserInfo', data: { ...userInfo} }).then((res) => {
      util.setStorage({
        key: "userInfo",
        data: userInfo
      });
      this.userInfo = userInfo;
      return userInfo;
    })
  },
  updateUserInfo(){
    new Promise((resolve, reject) => {
      wx.getSetting({
        success: (res) => {
          if (res.authSetting['scope.userInfo']) {
            wx.getUserInfo({
              withCredentials: false,
              success: resolve,
            })
          }
        },
      })
    }).then((res) => {
      var userInfo = res.userInfo;
      if (userInfo.nickName !== this.userInfo.nickName || userInfo.avatarUrl !== this.userInfo.avatarUrl) {
        this.sendUserInfo(userInfo);
      }
    })
  },
  isLogin(){
    return this.userInfo.nickName !== '' || (this.userInfo.avatarUrl !== '' && this.userInfo.avatarUrl !== 'https://minibizhi.313515.com/BiZhiStatic/default.svg')
  },

}) 