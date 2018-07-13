
'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var WxParse = require('../wxParse/wxParse.js');
var { Comment } = require('../../../utils/comment');

var officeNotes = new Basic();
officeNotes.expend(Comment,{
  data: {
    scollTop: 0,
  },
  onLoad: function (options) {
    this.__emit('onLoadBefore', options);
    this.__getData();
    if (getCurrentPages().length === 1) {
      this.setData({
        'suspensionInfo.isShareEntry': !0
      })
    }
  },
  onReachBottom_(e) {
  },
  onPageScroll_(e) {
    var _isHideBackTop = e.detail.scrollTop < 1800;
    if (_isHideBackTop !== this.data.isHideBackTop) {
      this.setData({
        isHideBackTop: _isHideBackTop
      })
    }
  },
  backTop() {
    this.setData({
      scollTop: 0
    })
  },
  // __addShare(obj) {
  //   obj.path = this.route + '?albumId=' + this.albumID;
  // },
  wxParseTagATap(e) {
    if (/id=([0-9]+)/.test(e.currentTarget.dataset.src)) {
      wx.redirectTo({
        url: '../officeNotes/officeNotes?albumID=' + RegExp.$1
      })
    }
  },
  __getData() {
    return util.request({ url: 'list/AlbumContent', data: { albumID: this.albumID } })
      .then((res) => {
        var article = res.Data.Album.Content;
        this.setData({
          title: res.Data.Album.AlbumName
        })
        WxParse.wxParse('article', 'html', article, this, 0);
        this.__getComment();
      })
  },
})
officeNotes.commentInit('专辑评论');
officeNotes.__init()
Page(officeNotes);