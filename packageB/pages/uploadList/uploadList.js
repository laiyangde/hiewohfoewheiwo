'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { MultiList } = require('../../../utils/multiList');
var Download = new Basic();
Download.__init({
  interfaceName: 'List/UserUploadList',
  title: '上传壁纸',
  isNeedUserID: !0,
  data: {
    isOpenDelete: !1,
    deleteSelected: 'deleteSelected'
  },
  __supplementParam(obj) {
    obj.userID = app.userInfo.userID;
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat((data.DataList || []).map(item=>{
      switch (item.Status){
        case 0:
          item.StatusText = "正在审核";
          item.StatusClass = "";
        break;
        case 1:
          item.StatusText = "审核通过";
          item.StatusClass = "success";
        break;
        default:
          item.StatusText = "拒绝通过";
          item.StatusClass = "fail";
      }
      return item;
    }));
    if (obj.dataList.length < 9) {
      obj.LoadingText = obj.dataList.length === 0 ? '您还未上传壁纸！' : '';
    }
    this.__reSetData(obj);
  },
  customOnLoad(options) {
    wx.hideShareMenu();
    this.selectedStr = "";
    this.__addProperties();
    this.__getRelative();
    this.__setTitle();
    this.__loadedMore()
    this.__emit('onLoadAfter', options);
  },
  toUpload(){
    wx.chooseImage({
      count: 1, // 默认9
      sizeType: ['original', 'compressed'], // 可以指定是原图还是压缩图，默认二者都有
      sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        wx.navigateTo({
          url: '../upload/upload?src=' + res.tempFilePaths[0]
        })
      }
    })
  },
  openDelete() {
    this.setData({
      isOpenDelete: !0
    })
  },
  deleteCancle() {
    var obj = {}
    var selectedStr = this.selectedStr;
    obj.isOpenDelete = !1;
    if (!selectedStr) return this.setData(obj)
    selectedStr.split(';').forEach((sub) => {
      if (sub) {
        obj['dataList[' + sub + '].deleteSelected'] = !1
      }
    })
    this.selectedStr = '';
    this.__reSetData(obj)
  },
  clickImage(e) {
    var _index = e.currentTarget.dataset.index;
    if (this.data.isOpenDelete) {//如果是打开了删除状态，则选择图片
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
      let img = this.dataList[_index].Image
      wx.previewImage({
        urls: [img],
        current: img
      })
      // this.preview(e);
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
  reload(){
    this.dataList = [];
    this.pageIndex = 0;
    var obj = {};
    obj.paddingTop = 0;
    obj.beforeIndex = -this.every;
    obj.afterIndex = this.every * 2;
    this.hasNext = !0;
    this.sectionIndex = 0;
    this.sectionPoistion = [];
    this.__loadedMore();
  },
  deleteSure() {
    // __filterTheSame
    if(this.isLoading) return;
    this.isLoading = true;
    wx.showToast({
      title: "正在删除",
      duration: 2e4,
      icon: "loading",
      mask: true
    });
    var obj = {},
      selectedArr = this.selectedStr.slice(0,-1).split(';'),
      dataList = this.dataList,
      uploadIDs = selectedArr.map(item=>{
        return dataList[item].UploadID
      }).join(',');
      util.request({
        url:"List/CancelUplaod",
        data:{
          uploadIDs,
          userID:app.userInfo.userID
        }
      }).then(res=>{
        wx.hideToast();
        selectedArr.sort((a, b) => { return b - a }).forEach((sub) => {
          dataList.splice(sub, 1);
        });
        obj.dataList = dataList;
        obj.isOpenDelete = !1;
        this.selectedStr = '';
        if (obj.dataList.length < 16) {
          obj.LoadingText = obj.dataList.length === 0 ? '您还未上传壁纸！' : '';
          if (obj.dataList.length < 10) {
            this.__loadedMore();
          }
        }
        this.__reSetData(obj);
        selectedArr = dataList = null;
        util.msg('删除成功');
        this.isLoading = false;
      }).catch(e=>{
        util.msg('删除失败',1);
        this.isLoading = false;
      })
  },
});

Page(Download);
