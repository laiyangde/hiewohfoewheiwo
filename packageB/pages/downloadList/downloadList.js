'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { MultiList } = require('../../../utils/multiList');
var Download = new Basic();
Download.expend(MultiList);

Download.__init({
  // interfaceName: 'list/download',
  title: '我的下载',
  dataName: 'baseDatas',
  count: 3,
  suffix: 'bz',
  selectedStr: '',
  data: {
    navArr: [
      { CategoryTitle: '壁纸' },
      { CategoryTitle: '表情' },
      { CategoryTitle: '头像' },
    ],
    template: ['can-delete-wallpaper-list', 'can-delete-avatar-emote-list', 'can-delete-avatar-emote-list'],
    diffrentTemplate: !0,
    isOpenDelete: !1,
    deleteSelected: 'deleteSelected'
  },
  changeBefore(currentIndex, obj) {
    this.deleteCancle();
    this.suffix = currentIndex === 0 ? 'bz' : (currentIndex === 1 ? 'bq' : 'tx')
  },
  customOnLoad(options) {
    wx.hideShareMenu();
    this.__addProperties();
    this.__getRelative();
    this.__setTitle();
    this.__loadedMore()
    this.__emit('onLoadAfter', options);
  },
  __getData() {
    if (this.isLoading) {
      return;
    }
    this.isLoading = !0;
    var obj = {};
    var cache = this.__getCache();

    obj.dataList = this.dataList.concat(cache.splice(0, 30));
    if (obj.dataList.length < 16) {
      obj.LoadingText = obj.dataList.length === 0 ? '您还未下载' + this.data.navArr[this.index].CategoryTitle + '！' : '';
    }
    setTimeout(() => {
      this.isLoading = false;
    }, 500)
    if (cache.length === 0) {
      this.hasNext = !1;
    }
    this.__reSetData(obj);
  },

  __getCache() {
    var sub = 'downloadData-' + this.suffix;
    if (this[sub]) {
      return this[sub];
    } else {
      return this[sub] = this.__filterTheSame(util.getStorageSync(sub) || []);
    }
  },
  openDelete() {
    this.setData({
      isOpenDelete: !0
    })
  },
  deleteCancle() {
    var obj = {}
    var selectedStr = this.selectedStr;
    selectedStr.split(';').forEach((sub) => {
      if (sub) {
        obj['dataList[' + sub + '].deleteSelected'] = !1
      }
    })
    this.selectedStr = '';
    obj.isOpenDelete = !1;
    this.__reSetData(obj)
  },
  clickImage(e) {
    if (this.data.isOpenDelete) {//如果是打开了删除状态，则选择图片
      var _index = e.currentTarget.dataset.index;
      var selectedStr = this.selectedStr;
      var _deleteSelected = this.dataList[_index].deleteSelected;//是否已经选择了
      if (_deleteSelected) {
        selectedStr = selectedStr.replace(_index + ';', '');
      } else {
        selectedStr += _index + ';';
      }
      this.selectedStr = selectedStr;
      var obj = {};
      obj['dataList[' + _index + '].deleteSelected'] = !_deleteSelected;
      this.__reSetData(obj)
    } else {
      this.preview(e);
    }
  },
  deleteSubmit: function () {
    var _this = this;
    if (!this.selectedStr) {
      util.msg('请选择图片', 1);
    } else {
      wx.showModal({
        title: '提示',
        content: '确认要删除壁纸？',
        confirmText: '删除',
        success(res) {
          if (res.confirm) {
            _this.deleteSure();
          }
        }
      })
    }
  },
  deleteSure() {
    // __filterTheSame
    var downloadDataCache = this.__getCache();
    var len = this.dataList.length;
    var obj = {};
    //按照从大到小排序在删除,如果无序删除或者从下到大删除将会不正确
    this.selectedStr.split(';').sort((a, b) => { return b - a }).forEach((sub) => {
      if (sub) {
        this.dataList.splice(sub, 1)[0];
      }
    });

    if (this.hasNext) {
      len = len - this.dataList.length;
      obj.dataList = this.dataList.concat(downloadDataCache.splice(0, len));
      if (downloadDataCache.length === 0) {
        this.hasNext = !1;
      }
    } else {
      obj.dataList = this.dataList;
    }

    if (obj.dataList.length < 16) {
      obj.LoadingText = obj.dataList.length === 0 ? '您还未下载' + this.data.navArr[this.index].CategoryTitle + '！' : '';
    }
    obj.isOpenDelete = !1;
    this.__reSetData(obj);
    //更新缓存
    util.setStorage({
      key: 'downloadData-' + this.suffix,
      data: this.dataList.concat(downloadDataCache)
    })
    this.selectedStr = '';
    util.msg('删除成功');
  },
});

Page(Download);
