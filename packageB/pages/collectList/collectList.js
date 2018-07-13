'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { MultiList } = require('../../../utils/multiList');

var Collect = new Basic();
Collect.expend(MultiList);
Collect.__init({
  interfaceName: 'list/CollectionList',
  title: '我的收藏',
  dataName: 'baseDatas',
  count: 3,
  isNeedUserID:!0,
  data: {
    navArr: [
      { CategoryTitle: '壁纸' },
      { CategoryTitle: '表情' },
      { CategoryTitle: '头像' },
    ],
    template: ['base-wallpaper-list', 'avatar-emote-list', 'avatar-emote-list'],
    diffrentTemplate: !0
  },
  customOnLoad(options) {
    var currentIndex = options.currentindex || 0;
    if (getCurrentPages().length === 1) {
      this.setData({
        'suspensionInfo.isShareEntry': !0
      })
    }
    this.userID = options.userid || app.userInfo.userID;
    this.username = options.username || app.userInfo.nickName;
    if (this.userID != app.userInfo.userID) {
      this.username = options.username || '游客'
      this.title = this.username + '的收藏';
    } else {
      this.username = app.userInfo.nickName
    }
    this.__addProperties();
    this.__getRelative();
    this.__setTitle();
    this.suffix = currentIndex === 0 ? 'bz' : (currentIndex === 1 ? 'bq' : 'tx');
    if (currentIndex != 0) {
      this.setData({
        currentIndex: currentIndex,
      })
    } else {
      this.__loadedMore();
    }
    
  },
  onShow() {
    if (!this.dataList || this.dataList.length == 0) {
      return;
    }
    if (app.userInfo.userID != this.userID) return;
    this.updateData();
    // this.collectStr = util.getStorageSync('collectStr-' + this.suffix);

    // this.dataList = [];
    // this.pageIndex = 0;
    // this.hasNext = !0;
    // this.filterStr = '';
    // this.__getData();
  },

  updateData() {
    var collect = util.toggle('collectStr-' + this.suffix);
    // var str = this.filterStr;
    var newData = this.dataList.filter((item) => {
      if (item.IsUserUpload == 1){
        return util.toggle('collectStr-sc').has(this.getFilterId(item));
      }
      return collect.has(this.getFilterId(item));
    });
    var len = this.dataList.length - newData.length;
    var obj = {
      dataList: newData
    };
    if (newData.length <= 10){
      obj.LoadingText = newData.length === 0 ? '您还未收藏' : ''
    }
    this.__reSetData(obj);
    if (len === 0 || !this.hasNext) return;
    this.pageIndex = this.pageIndex - 1 - Math.floor(len / 30);
    this.__getData();
  },

  changeBefore(currentIndex, obj) {
    this.interfaceName = currentIndex === 0 ? 'list/CollectionList' : 'list/networkpiccollectionlist';
    this.title = currentIndex === 0 ? '壁纸' : (currentIndex === 1 ? '表情' : '头像');
    this.suffix = currentIndex === 0 ? 'bz' : (currentIndex === 1 ? 'bq' : 'tx');
  },
  __supplementParam(obj) {
    obj.userID = this.userID;
    if (this.index !== 0) {
      obj.type = this.index === 1 ? 1 : 3
    }
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || []));
    if (obj.dataList.length < 16) {
      obj.LoadingText = obj.dataList.length === 0 ? (this.userID == app.userInfo.userID ? '您还未收藏' : this.username + '还未收藏') + this.data.navArr[this.index].CategoryTitle + '！' : '';
    }
    this.__reSetData(obj);
  },
  __addShare(obj) {
    obj.path = this.route + '?userid=' + this.userID + '&username=' + this.username + '&currentindex=' + this.data.currentIndex
  },
});

Page(Collect);