'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { Comment } = require('../../../utils/comment');
var { Poster } = require('../../../utils/poster');
var albumDetail = new Basic();

albumDetail.expend(Comment, Poster, {//扩展评论及属性方法
  title: '专辑',
  isNeedUserID: !0,
  noUpdateComment:!0,
  interfaceName: 'list/AlbumContent',
  data:{
    isAlbumComplete:false
  },
  __supplementParam(obj) {
    obj.albumID = this.albumID;
    obj.userID = app.userInfo.userID;
  },
  onLoadAfter(){
    this.__getComment();
  },
  // __addShare(obj) {
  //   obj.path = this.route + '?albumId=' + this.albumID
  // },
  __dealWithData(data, obj) {
    if (!this.data.AlbumObj) {
      obj.AlbumObj = data.Album;
    }
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || []));
    if (obj.dataList.length < 6) {
      obj.LoadingText = obj.dataList.length === 0 ? '暂无壁纸!' : '';
    }
    if (!this.hasNext) {
      obj.LoadingText = '';
      obj.isAlbumComplete = true;
    }
    this.__reSetData(obj);
  },
});
albumDetail.commentInit('专辑评论',50);
// var albumDetail = new Comment();
albumDetail.__init()
Page(albumDetail);