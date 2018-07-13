'use strict';
var app = getApp();
var { Basic } = require('../../../utils/basic');
var { util } = require('../../../utils/util');
var Intro = new Basic();
Intro.__init({
  interfaceName: 'List/BrandPicList',
  title: '品牌介绍',
  data:{
    BrandIntroduce:null
  },
  onLoadBefore(options){
    this.brandID = options.brandid;
    util.request({url:'List/BrandIntroduce',data:{
      brandID: this.brandID
    }}).then(res=>{
      if (res.ResultCode === '0'){
        this.setData({
          BrandIntroduce:res.Data
        })
      }
    }).catch(e=>{
      console.log(e)
    })
  },
  __supplementParam(obj){
    obj.brandID = this.brandID;
  },
  __dealWithData(data, obj) {
    console.log(data)
    obj.dataList = this.dataList.concat((data.DataList || []).map(item=>{
        return {
          Image:item.PicUrl,
          PicInfoID: item.PicID,
          ThumbImage: item.PicUrl
        }
    }));
    if (obj.dataList.length < 9) {
      obj.LoadingText = obj.dataList.length === 0 ? '暂无美图!' : '';
    }
    this.__reSetData(obj);
  },
  preview(e){
    var arr = this.dataList.map(item => {
      return item.Image
    })
    wx.previewImage({
      current: arr[e.currentTarget.dataset.index],
      urls: arr,
    })
  },
  __addShare(obj) {
    obj.path = this.route + '?brandid=' + this.brandID
  },
  toTaste(e){
    var { ExperienceMethod: method, CopyPicList: picList } = this.data.BrandIntroduce;
    wx.navigateTo({
      url: `../taste/taste?method=${method}&picList=${JSON.stringify(picList)
}`
    })
  }
});

Page(Intro);