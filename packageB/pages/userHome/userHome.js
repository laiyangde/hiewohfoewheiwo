'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { TopicReply } = require('../../../utils/topicReply');
var { Poster } = require('../../../utils/poster');
var UserHome = new Basic();
UserHome.expend(TopicReply, Poster,{
  title:'',
  interfaceName:'List/UploadSuccessList',
  needPageSize:5,
  isNeedUserID:true,
  data:{
    navArr: [
      { CategoryTitle: '壁纸', icon: 'https://minibizhi.313515.com/BiZhiStatic/userHome-collected.svg' },
      { CategoryTitle: '广场', icon: 'https://minibizhi.313515.com/BiZhiStatic/userHome-topic.svg' },
    ],
    currentIndex:0,
    // FansCount:0,
    // AttentionCount:0,
    // IsAttention:0,
    // WxUser:null,
    // ExpressionCollection:[],
    // PortraitCollection:[],
    // WallpaperCollection:[],
    scroll:0
  },
  onPageScroll(e) {
    this.onPageScroll_({
      detail: e
    })
  },
  onReachBottom(e) {
    this.onReachBottom_(e)
  },
  customOnLoad(options){
    this.viewUserId = options.userid;
    util.topicReplyChange = {};
    util.request({ url: 'list/UserCenterInfo', data: { viewUserID: this.viewUserId, currentUserID: app.userInfo.userID } },true).then((res) => {
        var { AttentionCount, FansCount, IsAttention, WxUser } = res.Data,
          obj = { AttentionCount, FansCount, IsAttention, WxUser };
        if (this.viewUserId == app.userInfo.userID) {
          obj.self = 1;
        }
        this.setData(obj);
        this.onLoaded(options);
      })
  },
  backTop(){
    // this.setData({
    //   scroll: 0
    // })
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  },
  // __loadedMore(){
  //   if (this.data.currentIndex === 0){
  //     if (!this.data.WxUser){
  //       return util.request({ url: 'list/UserCenterInfo', data: { viewUserID: this.viewUserId, currentUserID: app.userInfo.userID}})
  //         .then((res)=>{
  //           var { AttentionCount, FansCount, IsAttention,WxUser } = res.Data,
  //             obj = { AttentionCount, FansCount, IsAttention, WxUser},
  //           if (this.viewUserId == app.userInfo.userID){
  //             obj.self = 1;
  //           }
  //           this.setData(obj);
  //         })
  //     }
  //   }else{
  //    return this.__getData();
  //   }
  // },
  attentionUser(e){
    if (this.isLoading) return;
    this.isLoading = !0;
    var url = this.data.IsAttention === 0 ? 'List/AddAttention' : 'List/CancelAttention';
    var FansCount = this.data.IsAttention === 0 ? 1 : -1;
    util.request({ url, data: { userID: app.userInfo.userID, attentionUserID: this.data.WxUser.userID } }).then((res) => {
      this.setData({
        IsAttention: +!this.data.IsAttention,
        FansCount: this.data.FansCount + FansCount
      });
      this.isLoading = !1;
      util.msg(this.data.IsAttention === 1 ? '关注成功！' : '取消关注成功！', 1);
      // util.msg('关注成功！', 1)
    }).catch((e) => {
      console.log(e)
      util.msg('关注失败！', 1);
      this.isLoading = !1;
    })
  },
  navSwitch(e){
    var currentIndex = e.currentTarget.dataset.index;
    var obj = { currentIndex};
    if (this.data.currentIndex == currentIndex) return;
    util.abort()
    this.interfaceName = currentIndex == 0 ? "List/UploadSuccessList" : "ListPiazza/PiazzaList";
    obj.paddingTop = 0;
    obj.beforeIndex = -this.every;
    obj.afterIndex = this.every * 2;
    this.sectionIndex = 0;
    this.sectionPoistion = [];
    this.dataList = [];
    this.pageIndex = 0;
    this.filterStr = '';
    this.setData(obj);
    this.__loadedMore();
  },
  __addShare(obj) {
    obj.path = this.route + '?userid=' + this.viewUserId
  },
  __supplementParam(obj) {
    obj.userID = this.viewUserId;
    if(this.data.currentIndex == 1){
      obj.currentUserID = app.userInfo.userID;
      obj.userRelease = 1;
      obj.needComment = 1;
    }
  },
  __dealWithData(data, obj) {
    var data = data.DataList;
    if(this.data.currentIndex == 1){
      data = data.map((item) => {
        if (item.TopicResultInfo) {
          item.TopicPartResultInfo.TopicTitle = item.TopicResultInfo.TopicTitle;
          item.TopicPartResultInfo.TopicID = item.TopicResultInfo.TopicID;
        } else {
          item.TopicPartResultInfo.releaseType = 2;
        }
        item.TopicPartResultInfo.isHideAttention = !0;
        return item.TopicPartResultInfo
      });
      if (app.isLogin()) {
        obj.isLogin = !0
      }
      obj.dataList = this.dataList.concat(this.__parseComment(data));
      if (obj.dataList.length < 3) {
        obj.LoadingText = obj.dataList.length === 0 ? 'TA暂未发布内容' : '';
      }
      
    }else{
      obj.dataList = this.dataList.concat(data || []);
      if (obj.dataList.length < 16) {
        obj.LoadingText = obj.dataList.length === 0 ? 'TA暂未上传壁纸' : '';
      }
    }
    this.__reSetData(obj);
  },
})
UserHome.__init();

Page(UserHome);