'use strict';
var app = getApp();
var { util } = require('../../utils/util');
var { Basic } = require('../../utils/basic');
var { MultiList } = require('../../utils/multiList');
var { SelectNav } = require('../../utils/selectNav');
var { TopicReply } = require('../../utils/topicReply');
var { Poster } = require('../../utils/poster');
var photoView = new Basic();
photoView.expend(MultiList, TopicReply, SelectNav, Poster);

var isRed = util.getStorageSync('piazzaPageRed');
if (!isRed){
  photoView.onTabItemTap = function(){
    if (isRed) return;
    isRed = true;
    wx.hideTabBarRedDot({ index: 1 });
    util.setStorageSync('piazzaPageRed', 1);
  }
}

photoView.__init({
  interfaceName: 'ListPiazza/ActivityList',
  title: '发现',
  dataName: 'baseDatas',
  count: 3,
  needPageSize:5,
  exclude:',0,1,2,',
  everyCount:16,
  data: {
    navArr: [
      { CategoryTitle: '活动' },
      { CategoryTitle: '社区' },
      { CategoryTitle: '关注' },
    ],
    wonderfulTopic:[],
    wallpaperMask:[],//壁纸刘海
    diffrentTemplate:!0,
    template: ['activity-topic-list','piazza-list', 'topic-image-text-list'],
    // isShow:true,
    suspensionInfo:{
      isNavBack:false,
      title:'发现'
    }
  },
  isNeedUserID:!0,
  customOnLoad(options) {
    util.topicReplyChange = {};
    this.onLoaded(options);
  },
  onLoadBefore: function ({currentIndex=1}) {
    util.topicReplyChange = {};
    currentIndex = +currentIndex;
    var obj = {};
    if (currentIndex > 0) obj.currentIndex = currentIndex;
    this.index = currentIndex;
    this.interfaceName = this.index === 0 ? 'ListPiazza/ActivityList' : (this.index === 1 ? 'ListPiazza/PiazzaList' : 'List/AttentionList')
    this.setData(obj);
    util.request({ url:'list/WonderfulTopic'},true).then((res)=>{
      this.setData({
        wonderfulTopic:res.Data.DataList
      })
    })
    util.request({ url: 'list/RandomSytleList', data: { PageSize: 10 } }, true).then((res) => {
      this.setData({
        wallpaperMask: res.Data
      })
    })
  },
  toINOTCH(e){
    var index = e.currentTarget.dataset.index;
    if (index === undefined) return util.toINOTCH();
    
    var item = this.data.wallpaperMask[index];
    item.Image = item.Pic
    item.ThumbImage = item.PicThumb;
    
    util.toINOTCH(null, item)
  },
  toTopicDetail(e) {
    wx.navigateTo({
      url: '/packageA/pages/topicDetail/topicDetail?topicID=' + e.currentTarget.dataset.topicid
    })
  },
  changeBefore(index,obj){
    this.interfaceName = index === 0 ? 'ListPiazza/ActivityList' : (index=== 1 ?'ListPiazza/PiazzaList' : 'List/AttentionList')
  },
  __dealWithData(data, obj) {
    if(this.data.isShow){
      obj.dataList = this.dataList.concat(data.DataList||[]);
      this.__reSetData(obj);
      return;
    }

    if(this.index === 0 ){
      var data = data.DataList.map((item) => {
        return item =  this.getActivityStatus(item)
      });
      obj.dataList = this.dataList.concat(data || []);
    }else{
      var data = data.DataList.map((item) => {
        if (item.TopicResultInfo) {
          item.TopicPartResultInfo.TopicTitle = item.TopicResultInfo.TopicTitle;
          item.TopicPartResultInfo.TopicID = item.TopicResultInfo.TopicID;
        } else {
          item.TopicPartResultInfo.releaseType = 2;
        }
        return item.TopicPartResultInfo
      });
      obj.dataList = this.dataList.concat(this.__parseComment(data));
    }
    if (obj.dataList.length < 3) {
      obj.LoadingText = obj.dataList.length === 0 ? (this.index === 0 ? '暂无活动' : '就等你参与话题了！') : '';
    }
    this.__reSetData(obj);
  },
  getActivityStatus(data){
    var now = Date.now();
    var disS = (parseInt(data.StartDate.slice(6)) - now);
    var disE = (parseInt(data.EndDate.slice(6)) - now);
    if(disE>0){
      data.activityState1 = disS > 0 ? '距离开始还剩' : '距离结束还剩';
      data.activityState2 = Math.ceil((disS > 0 ? disS : disE) / 1000 /60 / 60 / 24 );
    }else{
      data.activityState1 = parseInt(data.CheckEndDate.slice(6)) - now > 0 ? '奖品核对中 ' : '已结束'
    }
    return data;
  },
  __supplementParam(obj) {
    obj.userID = app.userInfo.userID;
    obj.needComment = 1;
    if (this.data.suspensionInfo.currentNavIndex === 2){
      obj.userRelease = 1;
    }else{
      obj.sort = this.data.suspensionInfo.currentNavIndex + 1
    }
    
  },
  toPublish(){
    return wx.navigateTo({
      url: '/packageA/pages/replyTopic/replyTopic?releaseType=2'
    })
  },
  onPullDownRefresh(){
    this.dataList = [];
    this.pageIndex = 0;
    this.filterStr='';
    this.__loadedMore().then(()=>{
      setTimeout(()=>{
        wx.stopPullDownRefresh && wx.stopPullDownRefresh();
      },500)
    })
  }
});

Page(photoView);
