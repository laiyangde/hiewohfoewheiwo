'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var UserHome = new Basic();
UserHome.expend({
  interfaceName:'List/AuthorDetail',
  isNeedUserID:!0,
  data:{
    UserObject:{}
  },
  onShow(){
    if(this.idx !== undefined){
      var obj = this.__checkBuyAddData(this.dataList[this.idx].Array, `dataList[${this.idx}].Array`);
      this.__reSetData(obj);
      this.idx = undefined;
    }
  },
  customOnLoad(options){
    this.authorID = options.authorid;
    util.request({
      url: 'List/AuthorDetail',
      data: {
        authorID: this.authorID,
        userID: app.userInfo.userID,
        needAuthorInfo: 1,
        pageindex: 0,
        pagesize: 0
      }
    }).then(res=>{
        this.setData({
          UserObject: res.Data.UserObject
        })
        this.onLoaded();
    })
  },
  __dealWithData(data, obj) {
    var reward = util.toggle('rewardStr');
    (data.Array || []).forEach((item) => {
      item.Array.forEach((item) => {
        if (item.PriceType && !reward.has(item.PicInfoID)) {
          item.noBuy = !0
        }
      })
    })
    obj.dataList = this.dataList.concat(data.Array || []);
    if (obj.dataList.length < 3) {
      obj.LoadingText = obj.dataList.length === 0 ? '暂无原创壁纸!' : '';
    }
    this.__reSetData(obj);
  },
  __supplementParam(obj) {
    obj.userID = app.userInfo.userID;
    obj.authorID = this.authorID;
    obj.needAuthorInfo = 0;
  },
  attentionUser(e) {
    if (this.isLoading) return;
    this.isLoading = !0;
    var IsFollow = this.data.UserObject.IsFollow;
    var url = IsFollow === 0 ? 'List/AddAttention' : 'List/CancelAttention';
    var FansCount = IsFollow === 0 ? 1 : -1;
    util.request({ url, data: { userID: app.userInfo.userID, attentionUserID: this.data.UserObject.UserID } }).then((res) => {
      this.setData({
        [`UserObject.IsFollow`]: +!IsFollow,
        [`UserObject.FansCount`]: this.data.UserObject.FansCount + FansCount
      });
      this.isLoading = !1;
      util.msg(IsFollow == 0 ? '关注成功！' : '取消关注成功！', 1);
      // util.msg('关注成功！', 1)
    }).catch((e) => {
      console.log(e)
      util.msg('关注失败！', 1);
      this.isLoading = !1;
    })
  },
  onPageScroll(e) {
    this.onPageScroll_({
      detail: e
    })
  },
  onReachBottom(e) {
    this.onReachBottom_(e)
  },
  backTop() {
    wx.pageScrollTo({
      scrollTop: 0,
      duration: 0
    })
  },
  // oriPreview(e) {
  //   var {index,idx} = e.currentTarget.dataset;
  //   var item = this.dataList[idx].Array;
  //   this.idx = idx;
  //   util.relative = {
  //     interfaceName: '',
  //     baseData: { hasNext: false, pageIndex: 0, filterStr: '' },
  //     dataList: item.slice(0),
  //     params: {}
  //   }
  //   wx.navigateTo({
  //     url: '/pages/preview/preview?current=' + index + '&suffix=bz'
  //   })
  // },
  oriPreview(e) {
    var { index, idx } = e.currentTarget.dataset;
    var item = this.dataList[idx].Array;
    this.idx = idx;
    util.page = {
      hasNext: false,
      dataList: item.slice(0),
    }
    wx.navigateTo({
      url: '/pages/preview/preview?current=' + index + '&suffix=bz&index=0'
    })
  },
  __addShare(){
    obj.path = this.route + '?authorid=' + this.authorID;
  },
  moreAlbum(e){
    this.idx = e.currentTarget.dataset.idx;
    this.toPage(e)
  }
})
UserHome.__init();

Page(UserHome);