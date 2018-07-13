'use strict';
var app = getApp();
var { Basic } = require('../../utils/basic');
var { util } = require('../../utils/util');
var { MultiList } = require('../../utils/multiList');

var Home = new Basic();
Home.expend(MultiList);
Home.__init({
  interfaceName: 'list/WallpaperList',
  // count: 2,
  dataName: 'baseDatas',
  cacheArr: [],
  // needPageSize:90,
  data: {
    carouselFigures: [],//轮播
    carouselIndex: 0,
    topNavArr: {},//导航
    albumFigures: [],//专辑
    HotTrendsArray: null,//热门动态
    TopicResultInfo: null,//活动
    OriginalColumn: null,//原创专栏
    // isClose: true,//是否审核
    isVersionTip: false,
    // len: 0,
    // isAddBg: !1,
    currentIndex: 0,
    toScollTop: 0,
    minH: util.windowHeight,
    statusBarHeight: util.statusBarHeight
    // isScrollToTop: false,
    // sectionIndex:1,//壁纸列表版块
    // everyLine:16,//多少行算一个版块
    // paddingTop:0,
  },
  carouselChange(e){
    this.setData({
      carouselIndex: e.detail.current
    })
  },
  swiperHandle(e) {
    var index = e.currentTarget.dataset.index;
    var currentObj = this.data.carouselFigures[index];
    if (currentObj.DataType === 1) {
      wx.navigateTo({
        url: '/packageA/pages/albumDetail/albumDetail?albumID=' + currentObj.AlbumId
      })
    } else if (currentObj.DataType === 3) {
      wx.navigateTo({
        url: '../web/web?url=' + currentObj.ContentUrl
      })
    } else {
      util.toMiniProgram(currentObj.ID, currentObj.ContentUrl)
    }
  },
  hotAlbumHandle(e) {
    var { AlbumType, AlbumID } = this.data.albumFigures[e.currentTarget.dataset.index],
      url = '';
    switch (AlbumType) {
      case 1: url = '/packageA/pages/albumDetail/albumDetail?albumID=' + AlbumID; break;
      case 2: url = '/packageC/pages/officeNotes/officeNotes?albumID=' + AlbumID; break;
      case 3:
      case 4: url = '/packageA/pages/topicDetail/topicDetail?topicID=' + AlbumID; break;
    }
    wx.navigateTo({
      url
    })
  },
  toTopicReplyDetail() {
    wx.navigateTo({
      url: '/packageA/pages/topicReplyDetail/topicReplyDetail?partID=' + this.data.HotTrendsArray.PartID + '&topicID=' + this.data.HotTrendsArray.TopicID
    })
  },
  __checkBuy(data = []) {
    var reward = util.toggle('rewardStr');
    data.forEach((item, index) => {
      if (item.PriceType && !reward.has(item.PicInfoID)) {
        item.noBuy = !0
      }
    })
    return data;
  },
  onShow() {
    if (this.data.OriginalColumn){
      var obj = this.__checkBuyAddData(this.data.OriginalColumn.MiniOriginalWallpaperInfoArray, 'OriginalColumn.MiniOriginalWallpaperInfoArray');
      this.setData(obj);
    }

    // this.__setTitle();
  },
  onLoad(options) {
    var currentIndex = options.currentIndex || 0;
    this.index = +currentIndex;
    this.isAdView = false;//是否有广告显示
    this.adPosition = [];//保存广告位置
    this.recentPositionIndex = 0;//当前滚动条位置离最近的广告位置索引
    this.adH = 0;//广告高度
    util.request({
      url: 'List/SelectionList'
    }).then(res => {
      var data = res.Data;
      this.__checkBuy(data.OriginalColumn.MiniOriginalWallpaperInfoArray)
      var obj = {
        carouselFigures: data.CarouselArray,
        albumFigures: data.AlbumArray,
        OriginalColumn: data.OriginalColumn,
        currentIndex,
        // topNavArr: util.getStorageSync('topNav') || ''
        // navArr: data.NavigationList,
      };
      if (data.TopicResultInfo) {
        obj.TopicResultInfo = data.TopicResultInfo;
        if (data.BrandObj) {
          obj.TopicResultInfo.OfficialIcon = data.BrandObj.OfficialIcon
          obj.TopicResultInfo.Icon = data.BrandObj.Icon
        }
      } else {
        obj.HotTrendsArray = data.HotTrendsArray;
      }
      data.NavigationList.forEach((item,index)=>{
        if (item.CategoryID === 3 || item.CategoryID ===4){
          this.exclude += (index + ',')
        }
      })
      this.initNav(data.NavigationList, obj);
      this.onLoaded(options);
      this.getThreshold();
    }).catch(e => {
      console.log(e)
    })

    util.ad.then(res=>{//导航 悬浮窗广告
      var topNavArr = res['10001'] || {};
      var obj = { topNavArr }
      if (res['10002']){
        var { SwitchTime, adList } = res['10002'];
        var pageName = this.route.split('/').reverse()[0];
        var suspensionAd = { SwitchTime };
        suspensionAd.adList = adList.filter(item => {
          return item.PublishPage.indexOf(pageName) > -1
        })
        if (suspensionAd.adList.length > 0) {
          obj.suspensionAd = suspensionAd
        }
      }
      // if (res['10005']){//信息流
      //   obj.infoAd = res['10005'];
      //   obj.infoAd.current = 0;
      //   var random = Math.floor(Math.random() * obj.infoAd.adList.length);
      //   var sp = obj.infoAd.adList.splice(random);
      //   obj.infoAd.adList = sp.concat(obj.infoAd.adList)
      // }
      this.setData(obj)
    })
  
  },
  getThreshold(){
    setTimeout(() => {
      util.getRectsLoop('.index-scroll-view,.follow-nav-container').then(rect => {
        this.threshold = rect[1].top - rect[0].top + (this.scrollTop || 0) + -20
        // this.threshold = rect.top - (util.isIphoneX ? rpx2px() : rpx2px()) + (this.scrollTop || 0);
      })
    }, 400)
  },
  onReady() {
  },
  parseIndexNav(navData) {
    var visitedRedDotStr = this.visitedRedDotStr = util.getStorageSync('visitedRedDot');
    navData.forEach(item => {
      if (item.IsRedDot && visitedRedDotStr.indexOf(';' + item.CategoryID) > -1) {
        item.IsRedDot = false;
      }
    })
    return navData;
  },
  changeData(e){//换一换
    // if (this.test ==1){
    //   this.test = 0;
    //   util.msg('开始下载')
    //   wx.downloadFile({
    //     url: "https://filedown001.gao7.com/g2/M00/7A/7A/EycAAFsyHXGAcrI6AFqJ_9qT4RM961.MOV",
    //     success: (e) => {
    //       console.log(e);
    //       util.msg('下载完成')
    //       wx.saveVideoToPhotosAlbum({
    //         filePath: e.tempFilePath,
    //         success(res) {
    //           console.log(res.errMsg)
    //           util.msg('保存相册成功')
    //         },
    //         fail(e) {
    //           console.log(e)
    //           util.msg('保存相册失败')
    //         }
    //       })
    //       // wx.saveFile({
    //       //   tempFilePath: e.tempFilePath,
    //       //   success: function (res) {
    //       //     console.log(res.errMsg)
    //       //     util.msg('保存相册成功')
    //       //   },
    //       //   fail(e) {
    //       //     console.log(e)
    //       //     util.msg('保存相册失败')
    //       //   }
    //       // })
    //     },
    //     fail(e) {
    //       util.msg('失败')
    //     }
    //   })
    // }else{
    //   this.test = 1;
    //   wx.getSavedFileList({
    //     success(res) {
    //       var fileList = res.fileList;
    //       fileList.forEach(item => {
    //         var filePath = item.filePath;
    //         wx.removeSavedFile({
    //           filePath
    //         })
    //       })

    //     }
    //   })
    // }
    // return;

    if(this.isLoading) return;
      this.isLoading = true;
      var _type = e.currentTarget.dataset.type;
      util.request({
        url: _type == 1 ? 'List/HotTrends' : 'List/AuthorWallpaper'
      }).then(res=>{
        var obj = {};
        if(_type == 1 ){
          obj.HotTrendsArray = res.Data
        }else{
          this.__checkBuy(res.Data.DataList.MiniOriginalWallpaperInfoArray)
          obj.OriginalColumn = res.Data.DataList;
        }
        this.setData(obj)
        this.isLoading  = false;
        console.log(res)
      }).catch(e=>{
        console.log('换一换错误')
        this.isLoading = false;
      })
  },
  navSwitch(e) {
    var currentIndex = e.currentTarget.dataset.index;
    this.dynamicRelative.scollTop = this.scrollTop;
    var obj = {
      currentIndex
    }
    this.index = currentIndex;
    this.__getRelative();
    obj.isHideBackTop = this.isHideBackTop;
    if (this.positionArr) {
      obj.scrollLeft = this.positionArr[currentIndex];
    }
    var { IsRedDot, CategoryID } = this.data.navArr[currentIndex];
    if (IsRedDot) {
      this.visitedRedDotStr += ';' + CategoryID;
      obj[`navArr[${currentIndex}].IsRedDot`] = false;
      util.setStorage({
        key: "visitedRedDot",
        data: this.visitedRedDotStr
      });
    }
    obj.toScollTop = this.dynamicRelative.scollTop < this.threshold+20 ? this.threshold+20 : this.dynamicRelative.scollTop;
    this.setData(obj);
    if (this.dataList.length === 0) {
      // this.setData({
      //   toScollTop:this.threshold
      // })
      this.__loadedMore();
      // var p = this.__getData();
      // if(p){
      //   p.then(this.getLazyInfo);
      // }
    }
  },
  __supplementParam(obj) {
    if ('主题套图天数一对'.indexOf(this.data.navArr[this.index].CategoryName) > -1) {
      obj.pagesize = 8;
    }
    obj.categoryID = this.data.navArr[this.index].CategoryID;
  },

  //是否需要提示版本更新
  onLoadAfter: function () {
    // util.settingPromise.then(setting => {
    //   this.setData({
    //     isClose: !!setting.IsClose
    //   });
    //   var needVersionTip = app.needVersionTip || false;
    //   if (needVersionTip !== this.data.isVersionTip && !setting.IsClose) {
    //     setTimeout(() => {
    //       this.setData({
    //         isVersionTip: needVersionTip
    //       })
    //     }, 2000)
    //   }
    // })
    var needVersionTip = app.needVersionTip || false;
    if (needVersionTip !== this.data.isVersionTip) {
      setTimeout(() => {
        this.setData({
          isVersionTip: needVersionTip
        })
      }, 2000)
    }
  },
  //关闭提示
  closeVersionTip() {
    this.setData({
      isVersionTip: false
    })
  },
  
  updateAd(obj, deltaY){
    if (!this.data.infoAd) return;
    var i = this.recentPositionIndex, isAdView = false;
    if (deltaY < 0){
      var len = this.adPosition.length;
      for (; i < len;) {
        if (this.inWindow(this.adPosition[i], this.adH)) {
          isAdView = !0;
          this.recentPositionIndex = i;
          break;
        }
        i++;
      }
    }else{
      for (; i >= 0;) {
        if (this.inWindow(this.adPosition[i], this.adH)) {
          isAdView = !0;
          this.recentPositionIndex = i;
          break;
        }
        i--;
      }
    }
    // console.log(isAdView, this.isAdView !== isAdView && isAdView === false)
    if (this.isAdView !== isAdView && isAdView === false){
      obj['infoAd.current'] = (this.data.infoAd.current + 1) % this.data.infoAd.adList.length;
      console.log(obj['infoAd.current'])
    }
    this.isAdView = isAdView;
  },
  inWindow(position,height){
    return this.scrollTop < position + height && this.scrollTop + util.windowHeight > position
  },
 
  backTop() {
    // this.recentPositionIndex = 0;
    this.__reSetData({
      toScollTop: 0,
      sectionIndex: 1,//壁纸列表版块
      paddingTop: 0,
    })
  },

  /*=====================================================================================*/
  __dealWithData(data, obj) {
    if (data.StyleList) {
      var styleList = data.StyleList;
      data.DataList.forEach((item, index) => {
        Object.assign(item, styleList[index])
      })
    }
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || []));
    this.__reSetData(obj);
  },

  __addShare(obj, e) {
    obj.path = this.route + '?currentIndex=' + this.data.currentIndex
  },
  oriPreview(e){
    // var index = e.currentTarget.dataset.index;
    // util.relative = {
    //   interfaceName: '',
    //   baseData: { hasNext:false, pageIndex:0, filterStr: '' },
    //   dataList: this.data.OriginalColumn.MiniOriginalWallpaperInfoArray.slice(0),
    //   params:{}
    // }

    var index = e.currentTarget.dataset.index;
    util.page = {
      hasNext:false,
      dataList: this.data.OriginalColumn.MiniOriginalWallpaperInfoArray.slice(0)
    };
    wx.navigateTo({
      url: '/pages/preview/preview?current=' + index + '&suffix=bz&index=0'
    })
  }
});

Page(Home);