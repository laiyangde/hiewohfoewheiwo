'use strict';
var app = getApp();
var { Basic } = require('../../../utils/basic');
var { util } = require('../../../utils/util');
var { TopicReply } = require('../../../utils/topicReply');
var PureList = new Basic();


function getPageParam(pageIndex) {
  function filter(data) {
    data.filter((item) => {
      item.CreateDate = util.getDistance(item.CreateDate);
      return item;
    })
    return data;
  }
  var obj = null;
  switch (+pageIndex) {
    case 0:
      obj = {
        interfaceName: 'list/UserPraise',
        title: '赞我的',
        template: 'thump-up-me-list',
        noDataText: '暂没有赞！',
        filter,
        toThumpUpPage(e) {
          var { PraiseType, PartID, CommentType, IsDelete } = this.dataList[e.currentTarget.dataset.index];

          if (IsDelete === 1) {
            return wx.navigateTo({
              url: '/packageA/pages/topicReplyDetail/topicReplyDetail?isdelete=1'
            })
          }
          var url = '';
          //PraiseType
          //1话题发布点赞  2广场发布点赞  3话题或广场评论点赞   4 专辑评论点赞
          //CommentType

          // if (PraiseType === 4 || PraiseType === 3 && CommentType === 0){
          //   url = '../albumDetail/albumDetail?albumID=';
          // }else{
          //   url = '../topicReplyDetail/topicReplyDetail?partID=';
          // }
          var url = PraiseType === 4 ? '/packageA/pages/albumDetail/albumDetail?albumID=' : '/packageA/pages/topicReplyDetail/topicReplyDetail?partID='
          wx.navigateTo({
            url: url + PartID + '&releaseType=' + PraiseType
          })
          // albumID
        }
      }; break;
    case 1:
      obj = {
        interfaceName: 'list/CommentOnMyList',
        title: '评论我的',
        template: 'comment-me-list',
        noDataText: '暂无评论！',
        thresholdData: 4,
        filter,
        toCommentPage(e) {
          var { PartID, CommentType, IsDelete} = this.dataList[e.currentTarget.dataset.index];
          if (IsDelete === 1) {
            return wx.navigateTo({
              url: '/packageA/pages/topicReplyDetail/topicReplyDetail?isdelete=1'
            })
          }
          var url = CommentType === 0 ? '/packageA/pages/albumDetail/albumDetail?albumID=' : '/packageA/pages/topicReplyDetail/topicReplyDetail?partID='
          wx.navigateTo({
            url: url + PartID + '&releaseType=' + CommentType
          })
        },
      }; break;
    case 2:
      obj = {
        interfaceName: 'list/AttentionOnMeList',
        title: '关注我的',
        template: 'attention-list',
        noDataText: '还未有人关注您',
        filter,
      }; break;
    case 3:
      obj = {
        interfaceName: 'list/AttentionOnMeList',
        title: '粉丝',
        template: 'fans-list',
        noDataText: '暂没有粉丝！',
        __supplementParam(obj) {
          obj.userID = this.userid || app.userInfo.userID;
        },
        attention: TopicReply.attention,
        init(options, obj) {
          if (options.userid && options.userid != app.userInfo.userID) {
            obj.hideAttention = !0;
          }
        }
      }; break;
    case 4:
      obj = {
        interfaceName: 'list/AttentionOnMeList',
        title: '已关注',
        template: 'fans-list',
        noDataText: '暂没有关注！',
        __supplementParam(obj) {
          obj.userID = this.userid || app.userInfo.userID;
          obj.userAttention = 1;
        },
        attention: TopicReply.attention,
        init(options, obj) {
          if (options.userid && options.userid != app.userInfo.userID) {
            obj.hideAttention = !0;
          }
        }
      }; break;
    case 5:
      obj = {
        interfaceName: 'List/AuthorAlbum',
        template: 'original-wallpaper-list',
        noDataText: '暂没有壁纸！',
        onShow(){
          if (this.idx !== undefined) {
            var obj = this.__checkBuyAddData(this.dataList.slice(this.idx), `dataList`, this.idx);
            this.__reSetData(obj);
            this.idx = undefined;
          }
        },
        oriWallPaperPreview(e){
          this.idx = e.currentTarget.dataset.index;
          this.preview(e);
        },
        __supplementParam(obj) {
          obj.albumID = this.albumid;
        },
        filter(filterData) {
          var str = this.filterStr;
          var reward = util.toggle('rewardStr');
          var newData = filterData.filter(filterItem => {
            var id = filterItem.PicInfoID
            var b = str.indexOf(id) === -1;
            if (b) {
              str += id + ';';
              // 判断是否已经购买
              if (filterItem.PriceType && !reward.has(id)) {
                filterItem.noBuy = !0
              }
            }
            return b;
          })
          this.filterStr = str;
          return newData;
        }
      }; break;
    case 6:
      obj = {
        interfaceName: 'list/SearchList',
        template: 'base-wallpaper-list',
        noDataText: '暂没有壁纸！',
        init(options, obj) {
          obj['suspensionInfo.title'] = options.title;
          this.title = options.title;
        },
        __supplementParam(obj) {
          obj.word = this.title;
        },

      }; break;
  }
  return obj;
}
// https://testminibizhi.313515.com/list/SearchList?pageindex=0&pagesize=30&word=%E6%BC%AB%E5%A8%81&sort=1&SignatureMD5=529ba1c95d6651dd01fc41ed0e7fd1b4

PureList.__init({
  isNeedUserID:!0,
  data: {
    template: 'comment-me-list',
    pageName:'pureListPage'
  },
  onLoadBefore(options) {
    var { pageindex, ...otherOption } = options;
    var { init, template, isShowShare, pageName, ...pageParam } = getPageParam(options.pageindex || 0);
    if (!isShowShare) wx.hideShareMenu();
    var obj = { template };
    if (pageName) obj.pageName = pageName;
    init && init.call(this,options, obj);
    Object.assign(this, pageParam);
    Object.assign(this, otherOption);
    this.setData(obj);
    
  },
  __supplementParam(obj) {
    if (app.userInfo.userID) {
      obj.userID = app.userInfo.userID;
    }
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(this.filter(data.DataList || []));
    if (obj.dataList.length < (this.thresholdData || 10)) {
      obj.LoadingText = obj.dataList.length === 0 ? this.noDataText : '';
    }
    this.__reSetData(obj);
  },
  filter(data) {
    return data;
  }
});

Page(PureList);