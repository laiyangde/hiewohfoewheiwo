'use strict';
var app = getApp();
var { util } = require('../../utils/util');
var { Basic } = require('../../utils/basic');
var { Comment } = require('../../utils/comment');

var CommentList = new Basic();
CommentList.expend(Comment);
CommentList.__init({
  data: {
    isShowInput: !0,
    isLogin: app.userInfo && app.userInfo.nickName !== ''
  },
  title: '评论列表',
  isNeedUserID: !0,
  interfaceName: 'list/CommentList',
  onLoadBefore(options) {
    wx.hideShareMenu();
    util.commentListChange = {};
    this.commentInit(options.commentType);
    this.commentTargetId = options.commentTargetId;
    this.releaseType = options.releaseType || 1;
    this.replyIndex = options.replyIndex;
    // this.CommentIDs = util.getStorageSync(this.prefix + this.commentTargetId);
    this.interfaceName = this.listUrl;
    this.totalCount = options.totalCount;
  },
  onUnload() {
    if (util.commentListChange){
      util.commentListChange.modify = !0;
      util.commentListChange.commentArrs = this.dataList.slice(0, 5);
      util.commentListChange.totalCount = this.data.totalCount;
    }
    if (this.replyIndex !== undefined) {
      util.topicReplyChange.modify = !0;
      util.topicReplyChange[`dataList[${this.replyIndex}].CommentInfoList`] = this.dataList.slice(0,5);
      util.topicReplyChange[`dataList[${this.replyIndex}].CommentCount`] = this.data.totalCount;
    }
  },
  __supplementParam(obj) {
    obj[this.idKey] = this.commentTargetId;
    obj.commentType = this.releaseType;
    obj.userID = app.userInfo.userID;

    // if (this.albumID) {
    //   obj.albumID = this.albumID;
    // } else {
    //   obj.partID = this.partID;
    // }
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(data.DataList || []);
    obj.totalCount = this.totalCount || data.RecordCount;
    if (obj.dataList.length < 10) {
      obj.LoadingText = obj.dataList.length === 0 ? '就等你发表看法了~!' : '';
    }
    this.__reSetData(obj);
  },
  __commentUpdate(currentItem, obj) {
    this.dataList.unshift(currentItem);
    obj.dataList = this.dataList;
  },
  thumbUp(e) {
    if (this.isLoading) return;
    var index = e.currentTarget.dataset.index;
    var { CommentID, LikeCount, IsPraise } = this.dataList[index];
    if (IsPraise) return;
    this.isLoading = !0
    util.request({ url: this.praiseUrl, data: { commentID: CommentID, userID: app.userInfo.userID } }).then((res) => {
      util.msg('点赞成功！');
      this.__reSetData({
        [`dataList[${index}].IsPraise`]: !0,
        [`dataList[${index}].LikeCount`]: ++LikeCount
      });
      // this.CommentIDs += CommentID + ';';
      // util.setStorage({
      //   key: this.prefix + this.commentTargetId,
      //   data: this.CommentIDs
      // });
      this.isLoading = !1;
    }).catch((e) => {
      this.isLoading = !1;
      if (e.origin === 'server') {
        // util.msg(e.errMsg, 1);
        // this.__reSetData({
        //   [`dataList[${index}].active`]: !0,
        // });
        // this.CommentIDs += CommentID + ';';
        // util.setStorage({
        //   key: this.prefix + this.commentTargetId,
        //   data: this.CommentIDs
        // });
        return;
      }
      util.msg('点赞失败', 1);
    })
  },
  moreComment() {
  }
})
Page(CommentList);