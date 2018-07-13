'use strict';
var app = getApp();
var { Basic } = require('basic');
var { util } = require('util');

module.exports.Delete = {
  selectedStr: '',
  data: {
    isOpenDelete: !1,
    deleteSelected: 'deleteSelected',
    isShowDelete:undefined
  },
  openDelete() {
    this.setData({
      isOpenDelete: !0
    })
  },
  selectToggle(e) {
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
  deleteSubmit: function () {
    var _this = this;
    if (!this.selectedStr) {
      util.msg('请选择删除项', 1);
    } else {
      wx.showModal({
        title: '提示',
        content: '确认要删除？',
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
    wx.showLoading({ title: '正在删除...', mask: !0 });
    var obj = {};
    var stringList = '';
    var seletedArr = this.selectedStr.slice(0, -1).split(';');
    seletedArr.forEach((sub) => {
      var { PartID, releaseType = 1 } = this.dataList[sub];
      stringList += `${releaseType};${PartID},`
    });
    stringList = stringList.slice(0, -1);

    // this.selectedStr.split(';').sort((a, b) => { return b - a }).forEach((sub) => {
    //   if (sub) {
    //     var { PartID, releaseType} = this.dataList.splice(sub, 1)[0];
    //     stringList += `${releaseType};${PartID},`
    //   }
    // });
    util.request({ url: 'ListPiazza/DeleteRelease', data: { stringList, userID: app.userInfo.userID } }).then((res) => {
      seletedArr.sort((a, b) => { return b - a }).forEach((sub) => {
        this.dataList.splice(sub, 1);
      });
      var obj = {
        dataList: this.dataList,
        isOpenDelete: !1
      };
      if (this.dataList.length < 5) {
        obj.LoadingText = obj.dataList.length === 0 ? (obj.isShowDelete = !1,'暂无广场发布') : '';
      }
      if (this.dataList.length < 4 && this.hasNext) {
        this.__getData();
      }
      this.__reSetData(obj)
      this.selectedStr = '';
      util.msg('删除成功!');
    }).catch((e)=>{
      util.msg('删除失败!');
    })
    // var strSub = 'downloadStr-' + this.suffix;
    // var arrSub = 'downloadData-' + this.suffix;
    // var downloadStr = util.getStorageSync(strSub);

    // var downloadDataCache = this.__getCache();
    // var len = this.dataList.length;
    // var obj = {};
    // //按照从大到小排序在删除,如果无序删除或者从下到大删除将会不正确
    // this.selectedStr.split(';').sort((a, b) => { return b - a }).forEach((sub) => {
    //   if (sub) {
    //     var deleteItem = this.dataList.splice(sub, 1)[0];
    //     downloadStr = downloadStr.replace(deleteItem.PicInfoID || deleteItem.ID + ';', '');
    //   }
    // });

    // if (this.hasNext) {
    //   len = len - this.dataList.length;
    //   obj.dataList = this.dataList.concat(downloadDataCache.splice(0, len));
    //   if (downloadDataCache.length === 0) {
    //     this.hasNext = !1;
    //   }
    // } else {
    //   obj.dataList = this.dataList;
    // }

    // if (obj.dataList.length < 16) {
    //   obj.LoadingText = obj.dataList.length === 0 ? '您还未下载' + this.data.navArr[this.index].CategoryTitle + '！' : '';
    // }
    // obj.isOpenDelete = !1;
    // this.__reSetData(obj);
    // //更新缓存
    // util.setStorage({
    //   key: arrSub,
    //   data: this.dataList.concat(downloadDataCache)
    // })
    // util.setStorage({
    //   key: strSub,
    //   data: downloadStr
    // })
    // this.selectedStr = '';
    // util.msg('删除成功');
  },
  deleteComplete() {
    this.selectedStr.split(';').sort((a, b) => { return b - a }).forEach((sub) => {
      if (sub) {
        this.dataList.splice(sub, 1);
      }
    });
  }
}