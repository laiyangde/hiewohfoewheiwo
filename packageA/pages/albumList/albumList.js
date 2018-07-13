'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { MultiList } = require('../../../utils/multiList');
var albumList = new Basic();
albumList.expend(MultiList);
albumList.__init({
  title: '专辑',
  interfaceName: 'list/AlbumList',
  dataName: 'baseDatas',
  isScrollNav:!0,
  data:{
    template:'album-list'
  },
  __supplementParam(obj) {
    obj.categoryId = this.categoryId;
    if (this.data.navArr.length > 0){
      obj.needCateList = 2
    }
  },
  __addShare(obj) {
    obj.path = this.route + '?categoryId=' + this.categoryId
  },
  customOnLoad(options) {
    this.categoryId = options.categoryId * 1 || util.setting.CategoryId || 0;
    //获取导航
    return util.request({
      url: 'list/AlbumList',
      data: {
        categoryId: this.categoryId,
        pageSize: 0
      }
    }).then(res => {
      var navArr = res.Data.CateList.map(item=>{
        var { CategoryID, CategoryTitle: CategoryName} = item;
        return { CategoryID, CategoryName}
      }), len = navArr.length, i = 0, obj = {};
      for (; i < len; i++) {
        if (navArr[i].CategoryID === this.categoryId) {
          this.index = i;
          break;
        }
      }
      return this.initNav(navArr);
    }).then(res => {
      this.onLoaded();
    }).catch(e => {
      console.log(e)
    })
  },
  changeBefore(currentIndex){
    this.categoryId = this.data.navArr[currentIndex].CategoryID;
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || []));
    if (obj.dataList.length < 10) {
      obj.LoadingText = obj.dataList.length === 0 ? '暂没有专辑！' : '';
    }
    this.__reSetData(obj);
  },
  albumDetail(e){
    var index = e.currentTarget.dataset.index,url;
    var { AlbumID, AlbumType} = this.dataList[index];
    switch (AlbumType){
      case 1: url = '/packageA/pages/albumDetail/albumDetail?albumID=' + AlbumID;break;
      case 2: url = '/packageC/pages/officeNotes/officeNotes?albumID=' + AlbumID;break;
      case 3:
      case 4: url = '/packageA/pages/topicDetail/topicDetail?topicID=' + AlbumID;break;
    }
    wx.navigateTo({
      url
    })
  }
})
Page(albumList);