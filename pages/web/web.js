// pages/web/web.js
var { util } = require('../../utils/util');
var app = getApp();
// var setting = {
//   shareTitle:'换一张壁纸，换一种心情',
//    isNeedOpenGId: false,
//    activityID:53
// }


Page({

  /**
   * 页面的初始数据
   */
  data: { 
    url:''
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    if (app.userInfo.userID) return this.customOnLoad(options);
    app.loginPromise.then(() => {
      // app.loginPromise = null;
      return this.onLoad(options);
    }).catch(() => {
      if (app.loginCount <= 6) {
        this.onLoad(options)
      }
    })
  },
  onLoaded({ url, isShare=0}){
    url = decodeURIComponent(url);
    this.url = url;
    if (url.indexOf('encrypt') > -1){
      var [origin, search=''] = url.split('?');
      var obj = { oauthid: app.userInfo.userID };
      if (search){
        var params = search.split('&');
        params.forEach(item=>{
          item = item.split('=');
          if (item[0] !== 'encrypt'){
            obj[item[0]] = item[1]
          }
        });
      }
      url = origin + util.getUrlSearch(obj);
    }

    console.log(url)
    
    

    // this.isShare = isShare;
    // this.setting = this.getSetting(url);
    // var { activityGUID = setting.activityGUID, isNeedOpenGId } = this.setting;
    // var obj = {};
    // obj.url = url + util.getUrlSearch({
    //   // activityGUID,
    //   oauthid: app.userInfo.userID,
    //   isshare: isShare,
    // })
    // if (isNeedOpenGId){
    //   wx.showShareMenu({
    //     withShareTicket: true
    //   })
    // }
    this.setData({url});
  },
  // getSetting(url){
  //   if (util.setting.activityData && util.setting.activityData.length>0){
  //     var res = util.setting.activityData.find(item=>{
  //       return item.url === url;
  //     })
  //     if (res) return res;
  //   }
  //   return setting;
  // },
  messageHandle(){

  },
  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    var obj = {
      // title: this.setting.shareTitle,
      path: this.route + '?url=' + encodeURIComponent(this.url),
      // success: this.shareSuccess.bind(this)
    }
    console.log(obj)
    return obj;
  },
  // shareSuccess(e){
  //   var isNewIos = util.wxVersion == '6.6.2' && util.platform !== 'android'
  //   if (!this.setting.isNeedOpenGId || !e.shareTickets) return;
  //   new Promise((resolve, reject)=>{
  //     wx.getShareInfo({
  //       shareTicket: e.shareTickets[0],
  //       success: resolve,
  //       fail: reject
  //     })
  //   }).then(res=>{
  //     var { encryptedData, iv } = res;
  //       return util.request({
  //         url:'https://mact.gao7.com/acts/api/AddLotteryNumberForShare',
  //         data:{
  //           encrypteddata: encryptedData,
  //           iv,
  //           oauthid:app.userInfo.userID,
  //           activityid: this.setting.activityGUID || setting.activityID
  //         }
  //       }).then(res=>{
          

  //         !isNewIos && util.msg('分享成功');
  //         var [url] = this.data.url.split('?');
  //         var search = util.getUrlSearch({
  //           oauthid: app.userInfo.userID,
  //           isshare: this.isShare,
  //           time: Date.now()
  //         })
  //         this.setData({
  //           url: url + search
  //         })
  //       }).catch(e=>{
  //         if (e.errMsg === '没有奖励'){
  //           !isNewIos &&　wx.showModal({
  //             title: '提示',
  //             content: '您今日已分享过，不在增加翻牌机会',
  //             showCancel: false
  //           })
  //         }
  //       })
  //   })
  // }
})