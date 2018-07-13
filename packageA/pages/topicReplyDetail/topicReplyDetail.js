'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { Comment } = require('../../../utils/comment');
var { Poster } = require('../../../utils/poster');
var topicReplyDetail = new Basic();
topicReplyDetail.expend(Comment, Poster, {
  title: '话题',
  needPageSize:10,
  data: {
    TopicPartResultInfo: [],
    scroll: 0,
    isContentDelete:!1
  },
  interfaceName: 'list/topiccommentlist',
  isNeedUserID: !0,
  customOnLoad(options) {
    if (options.isdelete == 1){//此话题回复被删除后显示删除页面
      return this.setData({
        isContentDelete:!0
      })
    }
    this.__addProperties();
    this.__getRelative();
    this.__setTitle();
    if (options.scene){
      let [partID, topicID, releaseType] = options.scene.split('_')
      this.partID = this.commentTargetId = partID;
      this.topicID = topicID;
      this.releaseType = releaseType;
    }else{
      this.partID = this.commentTargetId = options.partID || options.partid;
      this.topicID = options.topicID || options.topicid;
      this.releaseType = options.releaseType || 1;
    }

    this.replyIndex = options.replyIndex;
    util.commentListChange = {};
    if (app.isLogin()) {
      this.setData({
        isLogin: !0
      })
    }
    this.getDetailData().then(()=>{
      this.getHotComment();
      this.__loadedMore();
    })
    // this.__getData();
    
  },
  getDetailData(){
    return util.request({
      url: 'list/topicpartdetail', 
      data: {
        partID: this.partID,
        releaseType: this.releaseType,
        userID: app.userInfo.userID,
        sort:1
      }
    }).then(res=>{
      if (res.ResultCode === '0'){
        var data = res.Data;
        var TopicPartResultInfo = data.DataList.TopicPartResultInfo || {},
          obj = {};
        if (data.DataList.TopicResultInfo) {
          TopicPartResultInfo.TopicTitle = data.DataList.TopicResultInfo.TopicTitle;
          this.releaseType = 1;
          this.topicID = data.DataList.TopicResultInfo.TopicID;
        } else {
          TopicPartResultInfo.releaseType = 2;
          this.releaseType = 2;
        }
        this.partID = this.commentTargetId = TopicPartResultInfo.PartID;
        obj.totalCount = TopicPartResultInfo.CommentCount || TopicPartResultInfo.CommentInfoList.length;
        if (TopicPartResultInfo.UserID === app.userInfo.userID) {
          obj.isHideAttention = !0
        }
        var partIDs = util.getStorageSync('partIDs');
        if (partIDs.indexOf(TopicPartResultInfo.PartID + (this.releaseType === 1 ? '' : '.') + ';') > -1) {
          TopicPartResultInfo.active = !0;
        }
        TopicPartResultInfo.CreateDate = util.getDistance(TopicPartResultInfo.CreateDate);
        obj.TopicPartResultInfo = this.__parse(TopicPartResultInfo);
        // obj.isShowInput = !0
        this.setData(obj);
      }
    }).catch(e=>{
      console.log(e)
    })
  },
  getHotComment(){
    return util.request({
      url:'list/topiccommentlist',
      data:{
        partID:this.commentTargetId,
        commentType:this.releaseType,
        userID:app.userInfo.userID,
        pagesize:10,
        pageindex:0,
        sort:1
      }
    }).then(res=>{
      if (res.ResultCode === '0'){
        this.setData({
          hotComment: res.Data.DataList
        })
      }
    }).catch(e=>{
      console.log(e)
    })
  },
  onUnload() {
    if (this.replyIndex !== undefined) {
      // var TopicPartResultInfo = this.data.TopicPartResultInfo;
      // TopicPartResultInfo.CommentInfoList = this.data.commentArrs.slice(0,3);
      // TopicPartResultInfo.CommentCount = this.data.totalCount;
      // util.topicReplyChange[`dataList[${this.replyIndex}]`] = this.data.TopicPartResultInfo;
      // util.topicReplyChange.modify = !0;
      var TopicPartResultInfo = this.data.TopicPartResultInfo;
      TopicPartResultInfo.CommentCount = this.data.totalCount;
      util.topicReplyChange[`dataList[${this.replyIndex}].CommentCount`] = this.data.totalCount;
      util.topicReplyChange[`dataList[${this.replyIndex}].DiggCount`] = this.data.TopicPartResultInfo.DiggCount;
      util.topicReplyChange[`dataList[${this.replyIndex}].IsPraise`] = this.data.TopicPartResultInfo.IsPraise;
      util.topicReplyChange.modify = !0;
    }
  },
  attention(e) {
    if (this.isLoading) return;
    this.isLoading = !0;
    var { UserID: attentionUserID, IsAttention } = this.data.TopicPartResultInfo;
    var url = IsAttention === 0 ? 'List/AddAttention' : 'List/CancelAttention';
    util.request({ url, data: { userID: app.userInfo.userID, attentionUserID } }).then((res) => {
      this.__reSetData({
        [`TopicPartResultInfo.IsAttention`]: +!IsAttention
      });
      this.isLoading = !1
      // util.msg('关注成功！', 1)
    }).catch((e) => {
      util.msg('关注失败！', 1);
      this.isLoading = !1;
    })
  },
  topicReplythumbUp() {
    if (this.isLoading) return;
    this.isLoading = !0
    var { IsPraise, DiggCount, releaseType = 1 } = this.data.TopicPartResultInfo;
    if (IsPraise) return;
    // var partIDs = util.getStorageSync('partIDs');
    util.request({ url: 'list/topicpartpraise', data: { partID: this.partID, userID: app.userInfo.userID, releaseType } }).then((res) => {
      util.msg('点赞成功！');
      this.setData({
        [`TopicPartResultInfo.IsPraise`]: 1,
        [`TopicPartResultInfo.DiggCount`]: ++DiggCount
      });
      // partIDs += this.partID + (releaseType == 1 ? '' : '.') + ';';
      // util.setStorage({
      //   key: 'partIDs',
      //   data: partIDs
      // });
      this.isLoading = !1
    }).catch((e) => {
      if (e.origin === 'server') {
        util.msg(e.errMsg, 1);
        // if (e.errMsg === '已点赞,请勿重复点赞！') {
        //   this.setData({
        //     [`TopicPartResultInfo.active`]: !0,
        //   });
        //   partIDs += this.partID + (releaseType == 1 ? '' : '.') + ';';
        //   util.setStorage({
        //     key: 'partIDs',
        //     data: partIDs
        //   });
        // }
        return;
      }
      util.msg('点赞失败！', 1);
      // util.showErrorModal(e.toString() === '[object Object]' ? e.errMsg : e, '点赞失败！');
      this.isLoading = !1
    })
  },
  backTop() {
    this.setData({
      scroll: 0
    })
  },
  __supplementParam(obj) {
    obj.userID = app.userInfo.userID;
    obj.commentType = this.releaseType;
    obj.partID = this.partID;
    obj.sort = 0;//0最新 1热门
  },
  __addShare(obj) {
    var _this = this;
    var releaseType = this.releaseType;
    obj.path = this.route + '?partID=' + this.partID + '&topicID=' + this.topicID + '&releaseType=' + releaseType;
    obj.success = function () {
      util.request({ url: 'list/topicpartshare', data: { partID: _this.partID, releaseType } }).then((res) => {
        console.log('分享统计成功！')
      })
    }
  },
  viewOriginImage(e) {
    var index = e.currentTarget.dataset.index;
    var dataItem = this.data.TopicPartResultInfo.TopicPartPicResultInfoList;
    dataItem = dataItem.map((item) => {
      return item.PicUrl
    })
    wx.previewImage({
      current: dataItem[index],
      urls: dataItem
    })
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(data.DataList || []);
    if (obj.dataList.length < 10) {
      obj.LoadingText = obj.dataList.length === 0 ? '就等你发表看法了~!' : '';
    }
    this.__reSetData(obj);
  },
  toTopicDetail() {
    var pages = getCurrentPages();
    if (pages.length > 1 && pages[pages.length - 2].route === "pages/topicDetail/topicDetail") {
      wx.navigateBack();
    } else {
      wx.navigateTo({
        url: '../topicDetail/topicDetail?topicID=' + this.topicID
      })
    }
  },
  __parse(data) {
    var reg = /_(\d{1,4})x(\d{1,4})/;
    var dataImageList = data.TopicPartPicResultInfoList;
    if (dataImageList && dataImageList.length > 0) {
      if (dataImageList.length === 1) {
        dataImageList[0].style = this.getStyle(dataImageList[0].Thumb.match(reg));
      } else {
        switch (dataImageList.length) {// 2 4             3 6 9                5 8       7
          case 2: case 4: data.addClass = 'mode1'; break;
          case 3: case 6: case 9: data.addClass = 'mode2'; break;
          case 5: case 8: data.addClass = 'mode3'; break;
          case 7: data.addClass = 'mode4'; break;
        }
      }
    }
    return data;
  },
  getStyle(size) {
    var [, width, height] = size;
    var r = width / height;
    if (r === 1) {
      if (width < 594) {
        var res = Math.max(260, width);
        return `width:${res}rpx;height:${res}rpx;`
      }
      return `width:594rpx;height:594rpx;`;
    }
    var minW, maxW, minH, maxH;
    if (r > 1) {
      minW = 507; maxW = 594; minH = 290; maxH = 340;
    } else {
      minW = 280; maxW = 360; minH = 499; maxH = 606;
    }
    var h = maxW / width * height;
    var w = maxH / height * width;
    if (width <= maxW && height <= maxH) {
      if (width < minW && height <= minH) {
        var rMin = minW / minH;
        return r > rMin ? `width:${minW}rpx;height:${minW / width * height}rpx;` : `width:${minH / height * width}rpx;height:${minH}rpx;`
      }
      return `width:${width}rpx;height:${height}rpx;`
    }

    if (h <= maxH) {
      return `width:${maxW}rpx;height:${h}rpx;`
    } else {
      return w < minW && r < 1 ? `width:${maxW}rpx;height:${maxH}rpx;` : `width:${w}rpx;height:${maxH}rpx;`
    }
  },
  __commentUpdate(currentItem, obj) {
    var dataList = this.dataList;
    dataList.unshift(currentItem);
    obj.dataList = dataList;
  },
  
});
topicReplyDetail.commentInit('话题评论');
topicReplyDetail.__init()
Page(topicReplyDetail);