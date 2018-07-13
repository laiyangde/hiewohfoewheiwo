'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { MultiList } = require('../../../utils/multiList');
var { SelectNav } = require('../../../utils/selectNav');
var authorColumn = new Basic();
authorColumn.expend(MultiList, SelectNav);

authorColumn.__init({
  interfaceName: 'List/ContractAuthorList',
  dataName: 'baseDatas',
  count: 3,
  needPageSize: 5,
  exclude: ',0,1,2,',
  data: {
    navArr: [
      { CategoryTitle: '作者' },
      { CategoryTitle: '作品' },
      { CategoryTitle: '入驻' },
    ],
    diffrentTemplate: !0,
    template: ['authors', 'original-wallpaper-list', 'authors-enter'],
    suspensionInfo: {
      isNavBack: true,
      selectedNavItems: ['按最新排序', '按热度排序', '按总榜排序']
    }
  },
  isNeedUserID: !0,
  onLoadBefore: function ({ currentindex = 0 }) {
    var currentIndex = +currentindex;
    var obj = {};
    if (currentIndex > 0) obj.currentIndex = currentIndex;
    if (currentIndex == 1) obj['suspensionInfo.isSelectedNav'] = false;
    else{
      obj['suspensionInfo.isSelectedNav'] = null;
    }
    this.index = currentIndex;
    this.interfaceName = this.getInterface();
    this.setData(obj);
  },
  getInterface(index = this.index){
    return index === 0 ? 'List/ContractAuthorList' : (index === 1 ? '/List/OriginalList' : 'List/JoinAuthorInfos')
  },

  changeBefore(index, obj) {
    this.interfaceName = this.getInterface();
    if (index == 1){
      this.needPageSize = 90;
      obj['suspensionInfo.isSelectedNav'] = false;
    }else{
      obj['suspensionInfo.isSelectedNav'] = null;
    }
    
  },
  __dealWithData(data, obj) {
    var _data = data.DataList || data || [];
    data = null;
    var reward = util.toggle('rewardStr');
    if(this.index == 0){
      _data.forEach((item)=>{
        item.MiniOriginalWallpaperInfoArray.forEach((item) => {
          if (item.PriceType && !reward.has(item.PicInfoID)) {
            item.noBuy = !0
          }
        })
      })
    }else if(this.index===1){
      _data = this.__filterTheSame(_data).map(item=>{
        if (item.PriceType && !reward.has(item.PicInfoID)) {
            item.noBuy = !0
        }
          return item;
      });
    }
    obj.dataList = this.dataList.concat(_data);
    if (obj.dataList.length < 5) {
      obj.LoadingText = obj.dataList.length === 0 ? (this.index == 0 ? '暂无作者!':'暂无壁纸') : '';
    }
    this.__reSetData(obj);
  },
  __supplementParam(obj) {
    obj.userID = app.userInfo.userID;
    if(this.index === 1){
      obj.sort = this.subNavIndex + 1;
    }
  },
  __addShare(obj) {
    obj.path = this.route + '?currentindex=' + this.index
  },
  onShow() {
    if (this.idx !== undefined) {
      if(this.index === 0){
      var obj = this.__checkBuyAddData(this.dataList[this.idx].MiniOriginalWallpaperInfoArray, `dataList[${this.idx}].MiniOriginalWallpaperInfoArray`);
      } else if (this.index === 1){
        var obj = this.__checkBuyAddData(this.dataList.slice(this.idx), `dataList`);
      }
      this.__reSetData(obj);
      this.idx = undefined;
    }
  },
  // oriPreview(e) {
  //   var { index, idx } = e.currentTarget.dataset;
  //   var item = this.dataList[idx].MiniOriginalWallpaperInfoArray;
  //   this.idx = idx;
  //   util.relative = {
  //     interfaceName: '',
  //     baseData: { hasNext: false, pageIndex: 0, filterStr: '' },
  //     dataList: item.slice(0),
  //     params: {}
  //   }
  //   wx.navigateTo({
  //     url: '/pages/preview/preview?current=' + index + '&suffix=bz'
  //   })
  // },
  oriPreview(e) {
    var { index, idx } = e.currentTarget.dataset;
    var item = this.dataList[idx].MiniOriginalWallpaperInfoArray;
    this.idx = idx;
    util.page = {
      hasNext: false,
      dataList: item.slice(0),
    }
    wx.navigateTo({
      url: '/pages/preview/preview?current=' + index + '&suffix=bz&index=0'
    })
  },
  oriWallPaperPreview(e) {
    this.idx = e.currentTarget.dataset.index;
    this.preview(e);
  },
  moreAlbum(e) {
    this.idx = e.currentTarget.dataset.idx;
    this.toPage(e)
  }
});

Page(authorColumn);
