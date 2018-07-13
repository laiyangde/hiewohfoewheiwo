'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { MultiList } = require('../../../utils/multiList');
var { TopicReply } = require('../../../utils/topicReply');
var { Delete } = require('../../../utils/delete');
var MyPublish = new Basic();
MyPublish.expend(MultiList, TopicReply, Delete);

MyPublish.__init({
  interfaceName: 'ListPiazza/PiazzaList',
  title: '我的发布',
  dataName: 'baseDatas',
  count: 2,
  needPageSize:5,
  data: {
    navArr: [
      { CategoryTitle: '广场' },
      { CategoryTitle: '评论' },
    ],
    diffrentTemplate: !0,
    template: ['topic-image-text-list','comment-me-list'],
    isShowDelete:!1
  },
  isNeedUserID: !0,
  onLoadBefore: function (options) {
    util.topicReplyChange = {};
    wx.hideShareMenu();
  },
  toTopicDetail(e) {
    wx.navigateTo({
      url: '/packageA/pages/topicDetail/topicDetail?topicID=' + e.currentTarget.dataset.topicid
    })
  },
  changeBefore(index, obj) {
    this.interfaceName = index === 0 ? 'ListPiazza/PiazzaList' : 'List/UserCommentList';
    if(index === 1){
      obj.isShowDelete = !1;
      this.isShowDeleteTemp = this.data.isShowDelete;
    }else{
      obj.isShowDelete = this.isShowDeleteTemp;
    }
  },
  __dealWithData(data, obj) {
    var data = data.DataList;
    if (data.length > 0 && data[0].TopicPartResultInfo){
      data = data.map((item) => {
        if (item.TopicResultInfo) {
          item.TopicPartResultInfo.TopicTitle = item.TopicResultInfo.TopicTitle;
          item.TopicPartResultInfo.TopicID = item.TopicResultInfo.TopicID;
        }else{
          item.TopicPartResultInfo.releaseType = 2;
        }
        return item.TopicPartResultInfo
      });
      obj.dataList = this.dataList.concat(this.__parseComment(data));
      if(obj.dataList.length > 0){
        obj.isShowDelete = !0;
      }
     
    }else{
      var { avatarUrl, nickName} = app.userInfo;
      data = data.map((item)=>{
        item.CreateDate = util.getDistance(item.CreateDate)
        item.AvatarUrl = avatarUrl;
        item.NickName = nickName;
        return item
      })
      obj.dataList = this.dataList.concat(data);
    }
    if (obj.dataList.length < 3) {
      obj.LoadingText = obj.dataList.length === 0 ? (this.data.currentIndex === 0 ? '暂无广场发布' : '暂无评论') : '';
    }
    this.__reSetData(obj);
  },
  __supplementParam(obj) {
    obj.userID = app.userInfo.userID;
    if(this.data.currentIndex === 0){
      obj.userRelease = 1;
      obj.needComment = 1;
    }
  },
  toCommentPage(e){
    var { PartID, CommentType, IsDelete } = this.dataList[e.currentTarget.dataset.index];
    if (IsDelete === 1) {
      return wx.navigateTo({
        url: '/packageA/pages/topicReplyDetail/topicReplyDetail?isdelete=1'
      })
    }
    var url = CommentType === 0 ? '/packageA/pages/albumDetail/albumDetail?albumID=' : '/packageA/pages/topicReplyDetail/topicReplyDetail?partID='
    wx.navigateTo({
      url: url + PartID + '&releaseType=' + CommentType
    })
  }
});

// MyPublish.__init({
//   interfaceName: 'list/mytopiclist',
//   title: '我发布的',
//   onLoadBefore: function () {
//     wx.hideShareMenu();
//     util.topicReplyChange = {};
//     // var obj = {};
//     // this.needPageSize = 10;
//     // this.topicID = topicID;
//     // this.showType = showType;
//     // this.sort = sort;
//     // this.topicImageContainer = [];
//     // if (showType === 2) {
//     //   obj.isListModel = !1;
//     // }
//     // if (sort === 2) {
//     //   obj.currentIndex = sort - 1;
//     // }
//     // this.setData(obj);
//   },
//   onShow() {
//     if (util.topicReplyChange.modify) {
//       delete util.topicReplyChange.modify;

//       if (util.topicReplyChange.currentIndex === 1) {
//         this.index = 1;
//         this.__getRelative();
//         this.__reSetData(util.topicReplyChange);
//         util.topicReplyChange = {};
//         this.pageIndex = 0;
//         this.dataList = [];
//         return this.__getData();
//       }
//       this.__reSetData(util.topicReplyChange);
//       util.topicReplyChange = {};
//     }
//   },
//   __supplementParam(obj) {
//     obj.userID = app.userInfo.userID
//   },
//   __dealWithData(data, obj) {
//     var data = data.DataList;

//     data = data.map((item)=>{
//       item.TopicPartResultInfo.TopicID = item.TopicResultInfo.TopicID;
//       item.TopicPartResultInfo.TopicTitle = item.TopicResultInfo.TopicTitle;
//       return item.TopicPartResultInfo
//     })
//     // console.log(data)
//     obj.dataList = this.dataList.concat(this.__parseComment(data || []));
//     if (obj.dataList.length < 4) {
//       obj.LoadingText = obj.dataList.length === 0 ? '您还未参与话题!' : '';
//     }
//     this.__reSetData(obj);
//   },
//   __addShare(obj, e) {
//     var { PartID, PartTitle, TopicPartPicResultInfoList: [{ PicUrl }] } = this.dataList[e.target.dataset.index],
//       _this = this;
//     obj.imageUrl = PicUrl;
//     obj.path = 'pages/topicReplyDetail/topicReplyDetail?partID=' + PartID;
//     obj.title = PartTitle
//     obj.success = function () {
//       _this.__statisticsShare(PartID);
//     }
//   },
//   toTopicDetail(e){
//     wx.navigateTo({
//       url: '../topicDetail/topicDetail?topicID=' + e.currentTarget.dataset.topicid
//     })
//   }
// });

Page(MyPublish);