'use strict';
var app = getApp();
var { Basic } = require('basic');
var { util } = require('util');
//评论类
// function TopicReply() {
//   Basic.call(this);
//   Object.assign(this.data, {

//   })
// }
// TopicReply.prototype = Object.create(Basic.prototype);
// Object.assign(TopicReply.prototype, {

// })

// module.exports.TopicReply = TopicReply;


module.exports.TopicReply = {
  // imageToggle(e) {
  //   var { index, idx } = e.currentTarget.dataset;
  //   if (this.dataList[index].currentIndex !== idx) {
  //     this.__reSetData({
  //       [`dataList[${index}].currentIndex`]: idx
  //     })
  //   }
  // },
  onShow() {
    if (util.topicReplyChange.modify) {
      delete util.topicReplyChange.modify;
      if (util.topicReplyChange.currentNavIndex !== undefined) {
        if (this.route === "pages/piazza/piazza"){
          this.index = util.topicReplyChange.currentIndex = 1;
        }else{
          this.index = util.topicReplyChange.currentIndex = 0;
        }
        this.__reSetData(util.topicReplyChange);
        this.__getRelative()
        util.topicReplyChange = {};
        this.pageIndex = 0;
        this.dataList = [];
        this.filterStr = '';
        return this.__getData();
      }
      this.__reSetData(util.topicReplyChange);
      util.topicReplyChange = {};
    }
  },
  viewOriginImage(e) {
    var { index, idx } = e.currentTarget.dataset;
    var urls = this.dataList[index].TopicPartPicResultInfoList.map((item) => {
      return item.PicUrl
    });
    wx.previewImage({
      urls,
      current: urls[idx]
    })
  },
  attention(e) {
    if (this.isLoading) return;
    this.isLoading = !0;
    var index = e.currentTarget.dataset.index;
    var { UserID: attentionUserID, IsAttention } = this.dataList[index];
    var url = IsAttention === 0 ? 'List/AddAttention' : 'List/CancelAttention';
    var indexs = [];
    util.request({ url, data: { userID: app.userInfo.userID, attentionUserID } }).then((res) => {
      var obj = {
        // [`dataList[${index}].IsAttention`]: +!IsAttention
      }
      indexs.forEach((item) => {
        obj[`dataList[${item}].IsAttention`] = +!IsAttention
      })
      this.__reSetData(obj);
      this.isLoading = !1;
      util.msg(IsAttention === 0 ? '关注成功！' : '取消关注成功！', 1)
    }).catch((e) => {
      util.msg('关注失败！', 1);
      this.isLoading = !1;
    });
    this.dataList.forEach((item, index) => {
      if (item.UserID == attentionUserID) {
        indexs.push(index);
      }
    })
  },
  toReplyDetail(e) {
    var index = e.currentTarget.dataset.index;
    var { PartID, TopicID, releaseType = 1 } = this.dataList[index];
    TopicID = TopicID || this.topicID;
    var url = `/packageA/pages/topicReplyDetail/topicReplyDetail?partID=${PartID}&replyIndex=${index}&releaseType=${releaseType}`
    if (TopicID !== undefined) {
      url += '&topicID=' + TopicID
    }
    wx.navigateTo({
      url
    })
  },
  moreComment(e) {
    var index = e.currentTarget.dataset.index;
    var { PartID, CommentCount, releaseType = 1 } = this.dataList[index];
    wx.navigateTo({
      url: `/pages/commentList/commentList?commentTargetId=${PartID}&totalCount=${CommentCount}&replyIndex=${index}&commentType=话题评论&releaseType=${releaseType}`
    })
  },
  topicReplythumbUp(e) {
    if (this.isLoading) return;
    this.isLoading = !0;
    var index = e.currentTarget.dataset.index;
    var { IsPraise, DiggCount, PartID, releaseType = 1 } = this.dataList[index];
    if (IsPraise) {
      this.isLoading = !1
      return;
    }
    util.request({ url: 'list/topicpartpraise', data: { partID: PartID, userID: app.userInfo.userID, releaseType } }).then((res) => {
      util.msg('点赞成功！');
      this.__reSetData({
        [`dataList[${index}].IsPraise`]: 1,
        [`dataList[${index}].DiggCount`]: ++DiggCount
      });
      // this.partIDs += PartID + (releaseType === 1 ? '' : '.') + ';';
      // util.setStorage({
      //   key: 'partIDs',
      //   data: this.partIDs
      // });
      this.isLoading = !1
    }).catch((e) => {
      this.isLoading = !1
      if (e.origin === 'server') {
        util.msg(e.errMsg, 1);
        // if (e.errMsg === '已点赞,请勿重复点赞！') {
        //   this.__reSetData({
        //     [`dataList[${index}].active`]: !0,
        //   });
        //   this.partIDs += PartID + (releaseType === 1 ? '' : '.') + ';';
        //   util.setStorage({
        //     key: 'partIDs',
        //     data: this.partIDs
        //   });
        // }
        return;
      }
      util.msg('点赞失败！', 1);
      // util.showErrorModal(e.toString() === '[object Object]' ? e.errMsg : e, '点赞失败！');

    })
  },
  __parseComment(DataList) {
    DataList = this.__filterTheSame(DataList);

    var reg = /_(\d{1,4})x(\d{1,4})/;
    // if (this.partIDs) {
    //   partIDs = this.partIDs;
    // } else {
    //   partIDs = this.partIDs = util.getStorageSync('partIDs');
    // }
    DataList.filter((item) => {
      var releaseType = item.releaseType;
      var t = `${item.PartID}`;
      if (releaseType) {
        t += '.'
      }
      // if (partIDs.indexOf(t + ';') > -1) {
      //   item.active = !0;
      // }
      item.CreateDate = util.getDistance(item.CreateDate);
      var itemImageList = item.TopicPartPicResultInfoList;
      if (itemImageList && itemImageList.length > 0) {
        if (itemImageList.length === 1) {
          itemImageList[0].style = this.getStyle(itemImageList[0].Thumb.match(reg));
        } else {
          switch (itemImageList.length) {// 2 4             3 6 9                5 8       7
            case 2: case 4: item.addClass = 'mode1'; break;
            case 3: case 6: case 9: item.addClass = 'mode2'; break;
            case 5: case 8: item.addClass = 'mode3'; break;
            case 7: item.addClass = 'mode4'; break;
            default: item.addClass = 'mode2';
          }
        }
      }
      if (item.UserID === app.userInfo.userID) {
        item.isHideAttention = !0
      }
      return item;
    })
    return DataList;
  },
  getStyle(size) {
    var [, width, height] = size;
    var r = width / height;
    if (r === 1) {
      if (width < 340) {
        var res = Math.max(260, width);
        return `width:${res}rpx;height:${res}rpx;`
      }
      return `width:340rpx;height:340rpx;`;
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
  __statisticsShare(partID, releaseType) {
    util.request({ url: 'list/topicpartshare', data: { partID, releaseType } }).then((res) => {
      console.log('分享统计成功！')
    })
  },
  onShareAppMessage(e) {
    // PicUrl: this.data.TopicResultInfo.TopicIcon
    var obj = util.share();
    if (e.target) {
      var { PartID, PartTitle, TopicPartPicResultInfoList: [{ PicUrl } = {}], TopicID, releaseType = 1 } = this.dataList[e.target.dataset.index],
        _this = this;
      TopicID = TopicID || this.topicID;
      if (PicUrl || this.data.TopicResultInfo){
        obj.imageUrl = PicUrl || this.data.TopicResultInfo.TopicIcon;
      }
      obj.path = `/packageA/pages/topicReplyDetail/topicReplyDetail?partID=${PartID}&releaseType=${releaseType}`
      if (TopicID !== undefined) {
        obj.path += '&topicID=' + TopicID;
      }
      obj.title = PartTitle
      obj.success = function () {
        _this.__statisticsShare(PartID, releaseType);
      }
    } else {
      obj.path = `${this.route}?currentNavIndex=${this.data.currentNavIndex}&topicID=${this.topicID}&currentIndex=${this.data.currentIndex}`
      this.__emit('__addShare', obj, e);
    }
    console.log('转发', obj.path)
    this.copySharelink(obj.path)
    return obj;
  },
  getFilterId(filterItem){
    return filterItem.PartID
  }
}