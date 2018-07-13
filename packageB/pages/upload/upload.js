'use strict';
var app = getApp();
var { Common } = require('../../../utils/common');
var { util } = require('../../../utils/util');
import WeCropper from '../../../utils/we-cropper.js';
var Upload = new Common();
var screenshotWidth = util.rpx2px(468),
    screenshotHeight = util.rpx2px(util.supperClass.indexOf('ipx') === -1 ? 832 : 1013.38);
Upload.expend({
  /**
   * 页面的初始数据
   */
  data: {
    isHideBackTop: true,
    isScreenshot: true,
    resSrc:"",
    pageIndex:0,
    category:[],
    subCategory:[],
    categoryIndex:-1,
    subCategoryIndexs:[]
  },
  /**
   * 生命周期函数--监听页面加载
   */
// 468 832  1013.38

  onLoad(options) {
    this.__setTitle('预览');
    wx.hideShareMenu();
    var cropperOpt = {
      id: 'cropper',
      src:options.src,
      scale: 2.5, // 最大缩放倍数
      zoom: 8, // 缩放系数
      cut: {
        x:0, // 裁剪框x轴起点
        y:0, // 裁剪框y轴期起点
        width: screenshotWidth, // 裁剪框宽度
        height: screenshotHeight // 裁剪框高度
      }
    }
    util.getRect(".cropper").then(res => {
      cropperOpt.width = res.width;
      cropperOpt.height = res.height;
      cropperOpt.cut.x = res.width - screenshotWidth >> 1;
      cropperOpt.cut.y = res.height - screenshotHeight >> 1;
      new WeCropper(cropperOpt).updateCanvas()
      cropperOpt = null;
    })
    var categoryData = wx.getStorageSync('categoryData');
    if (categoryData){
      this.categoryData = categoryData;
      this.setCategoryData();
    }else{
      util.request({
        url: 'list/Categorys',
      }).then(res=>{
        var data = res.Data.DataList.filter(item => {
          
          var b = !(item.CategoryID === 133 || item.CategoryID === 102);
          
          if (b) {
            delete item.Count;
            delete item.Image;
            item.SubArray = item.SubArray.slice(1).map(item => {
              return {
                SubID: item.SubID,
                SubName: item.SubName,
              }
            })
          }
          return b;
        })
        this.categoryData = data;
        this.setCategoryData();
        util.setStorage({
          key: 'categoryData',
          data
        })
      })
    }
  },
  uploadHandle(){
    var categoryIndex = this.data.categoryIndex,
      subCategoryIndexs = this.data.subCategoryIndexs;
    if (categoryIndex === -1){
      util.msg('请添加分类', 1);
      return this.changePage(2);
    }
    if (subCategoryIndexs.length === 0){
      util.msg('请添加标签', 1);
      return this.changePage(3);
    }
    if(this.isLoading) return;
    this.isLoading = true;
    var dataItem = this.categoryData[categoryIndex];
    wx.showNavigationBarLoading();
    wx.showToast({
      title:"正在上传",
      duration: 2e4,
      icon: "loading",
      mask: true
    });
    util.request({
      url:'List/UserUplaod',
      filePath: this.data.resSrc,
      name:"UserUplaod",
      data:{
        categoryID: dataItem.CategoryID,
        userID:app.userInfo.userID,
        tagIDs: subCategoryIndexs.map(item=>{
          return dataItem.SubArray[item].SubID
        }).join(',')
      }
    }).then(res=>{
      wx.hideToast();
      wx.hideNavigationBarLoading();
      util.msg("上传成功！");
      let _page = getCurrentPages();
      _page[_page.length - 2].reload();
      this.back();
      // packageB/pages/uploadList/uploadList
      this.isLoading = false;
    }).catch(e=>{
      console.log(e);
      wx.hideToast();
      wx.hideNavigationBarLoading();
      util.msg("上传失败！",1);
      this.isLoading = false;
    })
  },
  setCategoryData(){
    this.setData({
      category: this.categoryData.map(item=>{
        return item.CategoryTitle
      })
    })
  },
  selectCategory(e){
    var index = +e.currentTarget.dataset.index;
    if (this.data.categoryIndex != index){
      this.setData({
        categoryIndex: index,
        subCategoryIndexs:[]
      })
    }
  },
  selectSubCategory(e){
    var subCategoryIndexs = this.data.subCategoryIndexs,
      index = +e.currentTarget.dataset.index,
      exsitIndex = subCategoryIndexs.indexOf(index);
    if (exsitIndex > -1 ){
      subCategoryIndexs.splice(exsitIndex,1);
    }else{
      if (subCategoryIndexs.length >= 5) return util.msg("最多5个标签", 1);
      subCategoryIndexs.push(index);
    }
    this.setData({
      subCategoryIndexs
    })
  },
  changePage(e,isBack){
    var pageIndex = typeof e === "number" ? e : +e.currentTarget.dataset.pageindex,
    obj = { pageIndex}
    switch (pageIndex){
      case 1:
        obj['suspensionInfo.title'] = '上传壁纸'
        if(!isBack){
          if (this.data.categoryIndex !== -1) {
            if (this.data.subCategoryIndexs.length === 0) return util.msg('请选择标签', 1);
          }else{
            return this.wecropper.getCropperImage((avatar) => {
              if (avatar) {
                obj.resSrc = avatar;
                this.setData(obj);
              } else {
                util.msg('裁剪失败', 1)
              }
            })
          }
        }
      break;
      case 2:
        obj['suspensionInfo.title'] = '选择分类';
        break;
      case 3:
        obj['suspensionInfo.title'] = '选择标签';
        let categoryIndex = this.data.categoryIndex;
        if (categoryIndex === -1) return util.msg('请选择分类',1)
        obj.subCategory = this.categoryData[this.data.categoryIndex].SubArray.map(item=>{
            return item.SubName
        })
      break;
    }
    this.setData(obj);
  },
  cropperSure(){
    this.wecropper.getCropperImage((avatar) => {
      if (avatar) {
        this.setData({
          resSrc: avatar,
          isScreenshot:false
        })
      } else {
        util.msg('裁剪失败',1)
      }
    })
  },
  touchStart(e) {
    this.wecropper.touchStart(e)
  },
  touchMove(e) {
    this.wecropper.touchMove(e)
  },
  touchEnd(e) {
    this.wecropper.touchEnd(e)
  },
  back() {
    var pageIndex = this.data.pageIndex;
    if (pageIndex < 2){
      wx.navigateBack()
    }else{
      this.changePage(--pageIndex,1);
    }
  }
});

Page(Upload)