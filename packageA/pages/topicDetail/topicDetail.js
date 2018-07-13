'use strict';
var app = getApp();
var { TopicReply } = require('../../../utils/topicReply');
var { util } = require('../../../utils/util');
var { SelectNav } = require('../../../utils/selectNav');
var { Basic } = require('../../../utils/basic');
var { Poster } = require('../../../utils/poster');
var TopicDetail = new Basic();
TopicDetail.expend(SelectNav, TopicReply, Poster);

TopicDetail.__init({
  interfaceName: 'List/TopicPartInfoList',
  title: '话题',
  // count: 3,
  isNeedUserID:!0,
  // dataName: 'baseDatas',
  everyCount:16,
  data: {
    TopicResultInfo: [],
    template: 'topic-image-text-list',
    currentIndex: 0,
    scroll: 0,
    isLogin: !1,
    isFold: !0,
    // isListModel: !0,
    activityNavIndex:0,
    BrandInfo:{},
    TopicResultInfo:{},
    WinningList:[],
    isWinner:false,
    isShowVideoPoster:true
  },
  onPageScroll(e){
    this.onPageScroll_({
      detail:e
    })
  },
  onReachBottom(e){
    this.onReachBottom_(e)
  },
  customOnLoad(options){
    util.topicReplyChange = {};
    this.topicID = options.topicID || options.topicid || 1;
    util.request({ url: 'List/TopicInfoDetails', data: { topicID: this.topicID }}).then(res=>{
      if (res.ResultCode === "0"){
        var { BrandInfo = {}, TopicResultInfo } = res.Data;
        this.checkTime = parseInt(TopicResultInfo.CheckEndDate.slice(6))
        TopicResultInfo.StartDate = util.formatDate(TopicResultInfo.StartDate);
        TopicResultInfo.EndDate = util.formatDate(TopicResultInfo.EndDate);
        TopicResultInfo.CheckStartDate = util.formatDate(TopicResultInfo.CheckStartDate);
        TopicResultInfo.CheckEndDate = util.formatDate(TopicResultInfo.CheckEndDate);
        this.setData({
          TopicResultInfo,
          BrandInfo: BrandInfo || {}
        })
        if (TopicResultInfo.VideoUrl){
          this.videoContext = wx.createVideoContext('top-video');
          this.isVideoPlay = false;
          this.isFullScreen = false;
          var _this = this;
          wx.getNetworkType({
            success(res) {
              if (res.networkType === 'wifi'){
                _this.videoPlay()
              }
            }
          })
        }
        this.onLoaded(options)
      }
    }).catch(e=>{
      console.log(e)
    })
  },
  unFold() {
    this.setData({
      isFold: !this.data.isFold
    })
  },
  activityNavChange(e){
    var index = e.currentTarget.dataset.index;
    if (index === this.data.activityNavIndex) return;
    this.setData({
      activityNavIndex:index
    })
    if (index === 2 && this.data.WinningList.length === 0){
      util.request({ url: 'List/WinningList', data: { topicID:this.topicID}}).then(res=>{
        if (res.ResultCode === '0'){
          var obj = { WinningList: res.Data}
          for( var item of res.Data){
            if (item.UserInfo.userID == app.userInfo.userID){
              obj.isWinner = !0;
              break;
            }
          }
          this.setData(obj);
        }else{
          console.log(res.ResultMessage)
        }
      }).catch(e=>{
        console.log(e)
      })
    }

  },
  toReply(e) {
    return wx.navigateTo({
      url: '../replyTopic/replyTopic?topicID=' + this.topicID
    })
  },
  replyImagePreview(e) {
    var url = e.currentTarget.dataset.url;
    wx.previewImage({
      current: url,
      urls: [url],
    })
  },
  backTop() {
    // this.setData({
    //   scroll: 0
    // })
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  },
  onLoadBefore: function ({currentNavIndex = 0 }) {
    var obj = {};
    this.needPageSize = 5;
    this.topicImageContainer = [];
    obj.currentNavIndex = currentNavIndex;
    this.index = currentNavIndex;
    if (app.isLogin()) {
      obj.isLogin = !0;
    }
    this.setData(obj);
  },
  getSort(){
    return +this.data.suspensionInfo.currentNavIndex+1
  },
  __supplementParam(obj) {
    obj.sort = this.getSort();
    obj.topicID = this.topicID;
    obj.userID = app.userInfo.userID;
  },
  __dealWithData(data, obj) {
    var data = data.DataList;
    obj.dataList = this.dataList.concat(this.__parseComment(data || []));
    if (obj.dataList.length < 3) {
      obj.LoadingText = obj.dataList.length === 0 ? '就等你参与话题了！' : '';
    }
    this.__reSetData(obj);
  },
  // navItemSelectedAfter(currentNavIndex){
  //   this.index = currentNavIndex * 1;
  //   this.__getRelative();
  //   this.subNavIndex = currentNavIndex;
  //   if (this.dataList.length === 0) {
  //     this.__getData()
  //   }
  // },
  inputAddress(e){
    if (Date.now() > this.checkTime){
      return util.show('已超过奖品核对时间,您无法进行兑奖!')
    }else{
      this.toPage(e)
    }
  },
  videoHandle(e){
    var _type = e.type;
    console.log(e)
    switch (_type){
      case 'play':
        this.isVideoPlay = true;
        this.setData({
          isShowVideoPoster: false
        })
      break;
      case 'pause':
        if (!this.isFullScreen){
          this.setData({
            isShowVideoPoster: true
          })
        }
        this.isVideoPlay = false;
        // this.isFullScreen

        // this.videoContext.exitFullScreen()
      break;
      case 'ended':
        this.videoContext.seek(0);
        this.videoHandle({ 'type':'pause'});
      break;
      case 'fullscreenchange':
        this.isFullScreen = e.detail.fullScreen;
        if (!this.isFullScreen && !this.isVideoPlay){
          this.videoHandle({ 'type': 'pause' });
        }
      break;
    }
  },
  videoPlay(){
    this.videoContext.play();
  }
});

Page(TopicDetail);