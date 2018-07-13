'use strict'
var { Common } = require('../../utils/common');
var { util } = require('../../utils/util');
var app = getApp();
import Message from '../../utils/message';
function My() {
  Common.call(this);
  Object.assign(this.data, {
    miniProgramTitle: '',
    avatarUrl: '',
    nickName: '',
    newMessage:!1,
    isIphoneX: util.isIphoneX,
  });
  // this.messageFlag = '000';
  this.isNeedUserID = true;
  this.isOnload = true;
}
My.prototype = Object.create(Common.prototype);
Object.assign(My.prototype, {
  
  customOnLoad(options) {
    this.setData({
      [`suspensionInfo.title`]:'我的'
    })
    this.onLoaded(options);
  },
  onLoaded(options){
    if (app.isLogin()) {
      var { avatarUrl, nickName } = app.userInfo;
      this.setData({
        avatarUrl,
        nickName,
        isLogin: !0
      });
      this.getMessageCounts();
    }
    // util.messageCounts = util.getStorageSync('messageCounts') || { PraiseCount: 0, CommentCount: 0, AttentionUserCount: 0 };
    return this.__getMiniProgramData();
  },
  onShareAppMessage() {
    return util.share();
  },
  onShow(){
    if (this.isOnload){
      this.isOnload = false;
      return;
    }
    if (this.data.isLogin && !this.data.isClose) {
      this.getMessageCounts();
    }
  },
  /*=============================================================================================================*/

  // toPage(e) {
  //   var page = e.currentTarget.dataset.page;
  //   return wx.navigateTo({
  //     url: '../' + page + '/' + page
  //   })
  // },
  toMessageCenter(){
    wx.navigateTo({
      url: '/packageB/pages/message/message?messageFlag=' + this.messageFlag
    });
    // if (this.data.newMessage){
    //   this.setData({ newMessage: !1 })
    //   return util.setStorage({
    //     key: 'messageCounts',
    //     data: util.messageCounts
    //   });
    // }
  },
  getMessageCounts(){
    Message().update(app.userInfo.userID).then(res => {
      var obj = {};
      var msg = Message();
      var Dvalue = msg.Dvalue;
      if (Dvalue.needBrowerCount) {
        // wx.setTabBarBadge({
        //   index: 3,
        //   text: Dvalue.needBrowerCount + ''
        // })
        obj.newMessage = true
      }else{
        obj.newMessage = false
      }
      obj.UserAttentionCount = msg.new.UserAttentionCount;
      obj.fansCount = msg.new.AttentionUserCount;
      this.setData(obj);
      msg.promise = null;
    })
  },
  loginSuccess(e){
    var { avatarUrl, nickName } = app.userInfo;
    this.setData({
      avatarUrl,
      nickName,
      isLogin:!0
    });
    this.getMessageCounts();
    util.msg('登录成功');
  },
  clearUserInfo(){
    var userInfo = { "nickName": "", "gender": 0, "city": "", "province": "", "country": "", "avatarUrl": "https://minibizhi.313515.com/BiZhiStatic/default.svg"}
    app.sendUserInfo(userInfo,1).then(() => {
      var { avatarUrl, nickName } = userInfo;
      this.setData({
        avatarUrl,
        nickName,
        isLogin:!1
      });
    })
  },
  /*=============================================================================================================*/
  __getMiniProgramData() {
    
  },
})

Page(new My());
