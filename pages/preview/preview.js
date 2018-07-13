'use strict';
var app = getApp();
var { Basic } = require('../../utils/basic');
var { util } = require('../../utils/util');
var { Poster } = require('../../utils/poster');
var Preview = new Basic();
var secItemCount = 10;
var secCount = 3;
var loopCount = secItemCount * secCount;
Preview.expend(Poster,{
  interfaceName:'List/WallpaperRelate',
  dataName:'baseData',
  currentIndex:0,
  data: {
    currentIndex: 0,
    imgList:[],
    loadedArr: [],
    loadingArr: [],
    toTop:[],
    collectTxt: '收藏',
    isCollected: !1,
    noBuy: !1,
    isHideBuyPanel: !0,
    AuthorAvatar: 'https://minibizhi.313515.com/BiZhiStatic/default.svg',
    AuthorName: '',
    PriceType: 0.0,
    isShow2INOTCH: false,
    // is_p_ad_show: false,
    circular: false,//是否采用衔接滑动
    rewardWallPaper:{},
    isShowSuccess:false,
    successText:'下载',
    successWidth:'',
    adSwitchFlag:false,
    isShowFreeUnlock:false,
    isHideGuide:true
  },
  report(){
    var { IsUserUpload = 0, PicInfoID } = this.data.imgList[this.currentIndex];
    wx.showActionSheet({
      itemList: ['图片缺失、错误', '不雅内容', '版权问题'],
      itemColor:"#007aff",
      success: (res)=>{
        console.log(res.tapIndex)
        util.request({
          url: 'List/WallpaperReport',
          data: {
            "type": IsUserUpload == 0 ? 1 : 5,
            reason: res.tapIndex + 1,
            picID: PicInfoID
          }
        }).then(res=>{
          util.msg('举报成功!')
        }).catch(e=>{
          util.msg('举报失败!',1)
        })
      },
      fail: function (res) {
        console.log(res.errMsg)
      }
    })
  },
  onShow(){
    if (this.data.isShowSuccess){
      this.closeSuccessTip();
    }
  },
  getMore(){
    return this.page.__loadedMore();
  },
  checkSec(currentIndex, obj){
    var secIndex = Math.floor(currentIndex / secItemCount),
      realySecIndex = Math.floor((this.realyIndex - this.startIndex) / secItemCount),
      direct =  secIndex - this.secIndex,
      nextSecIndex,
      imgList,
      dataImgList = this.data.imgList,
      dataList = this.page.dataList,
      isNextSecEnough = true,
      sliceStart;
    console.log('检查模块，已经到达' + secIndex, '真实模块' + realySecIndex);
    if (direct === 0 || secIndex >= secCount) return;
    this.secIndex = secIndex;
    if (direct === 1 || direct < -1){
      sliceStart = (realySecIndex + 1) * secItemCount + this.startIndex;
      console.log(`正方向截取下标为${sliceStart}-${sliceStart + secItemCount}`)
      nextSecIndex = (secIndex + 1) % secCount;
      if (this.page.hasNext && dataList.length - sliceStart < secItemCount * 2) this.getMore();
    }else{
      if (realySecIndex === 0) return obj.circular = false;
      if (secIndex < secCount - 2 && dataImgList.length < loopCount - secItemCount){
        let d = dataImgList[0], i = dataImgList.length;
        while (i < loopCount - secItemCount){
          dataImgList.push(d);
          i++
        }
        console.log('补充数据到' + dataImgList.length)
      }
      if (dataImgList.length > loopCount) dataImgList = dataImgList.slice(0, loopCount)
      sliceStart = (realySecIndex - 1) * secItemCount + this.startIndex;
      console.log(`反方向截取下标为${sliceStart}-${sliceStart + secItemCount}`)
      nextSecIndex = (secIndex - 1 + secCount) % secCount;
    }
    imgList = dataList.slice(sliceStart, sliceStart + secItemCount);
    if (!this.data.circular) obj.circular = true;
    var i = nextSecIndex * secItemCount,
      addLen = imgList.length,
      endI = i + addLen,
      loadingArr = this.data.loadingArr,
      loadedArr = this.data.loadedArr;
    console.log(`改变${i}-${i + addLen}`)
    dataImgList.splice(i, addLen, ...imgList);
    obj.imgList = dataImgList;
    if (addLen < secItemCount){
      if (secIndex !== secCount - 1) {//当前模块不是最后一个模块
        console.log('下一模块不够了，不是最后模块，截取0-' + (secItemCount * (secIndex + 1) + addLen))
        obj.imgList = obj.imgList.slice(0, secItemCount * (secIndex + 1) + addLen);
        if (secIndex === 0) this.secIndex++;
      } else {
        console.log('下一模块不够了，是最后模块')
        obj.imgList = obj.imgList.concat(imgList);
      }
      obj.circular = false
    }
    if (addLen === 0) return;
    delete loadedArr[i];
    i += 1;
    while (i !== endI) {
      delete loadingArr[i];
      delete loadedArr[i];
      i++;
    }
    obj.loadingArr = loadingArr;
    obj.loadedArr = loadedArr;
  },
  change(e) {
    var obj = {};
    var currentIndex = e.detail.current;
    var preCurrentIndex = this.currentIndex;
    var direct = currentIndex - preCurrentIndex;
    direct = direct === 1 || direct < -1 ? 1  : -1;
    this.realyIndex += direct;
    if (!this.data.loadedArr[currentIndex]) {
      // 当前加载的壁紙未加载完成则停止加载
      if (!this.data.loadedArr[this.loadingIndex]) obj[`loadingArr[${this.loadingIndex}]`] = false;
      obj[`loadingArr[${currentIndex}]`] = true;
      this.loadingIndex = currentIndex;
    }
    //每个模块的secItemCount / 2 - 2位置  或者真实模块倒数第二个并且当前模块时模块0时 并且currentIndex === 2时触发
    if (currentIndex % secItemCount === secItemCount / 2 - 2) this.checkSec(currentIndex, obj);
    if (this.dataList.length > 0) {
      this.pageIndex = 0;
      this.hasNext = !0;
      this.filterStr = '';
      obj.dataList = [];
      obj.LoadingText = util.LoadingText;
      obj[`toTop[${preCurrentIndex}]`] = 0.01;
    }
    obj.currentIndex = currentIndex;
    this.__checkImage(currentIndex, obj);
    this.__reSetData(obj);
    this.currentIndex = currentIndex;
    // this.index = currentIndex;
    // this.__getRelative();

  },
  // 图片加载完成
  loadedHandle(e) {
    var index = e.target.dataset.index,
        i = index + 1,
        obj = {},
        loadingArr = this.data.loadingArr,
        endMark = Math.max(loopCount,this.data.imgList.length);
        console.log(index)
    obj['loadedArr[' + index + ']'] = !0;
    while (loadingArr[i % endMark] && i - index < 10){
      i++;
      console.log(1)
    }
    if(i - index < 10){
      obj['loadingArr[' + i + ']'] = true;
      this.loadingIndex = i;
      console.log('开始加载图片'+i)
    }
    this.setData(obj);
  },
  __supplementParam(obj) {
    obj.label = this.data.imgList[this.currentIndex].Labels;
  },
  __loadedMore(){
    return this.__getData()
  },
  // 图片加载错误
  // errorHandle(e) {
  //   var errMsg = e.detail.errMsg;
  //   var index = e.target.dataset.index;
  //   wx.showModal({
  //     title: '图片出错',
  //     content: '请选择其他图片下载。错误原因：' + errMsg + ' 您可以截图并在< 我的->意见反馈 > 里反馈此问题，我们会尽快解决问题，给您带来的不便敬请谅解！' + util.info,
  //     showCancel: false
  //   });
  // },
  // __dealWithData(data) {
  //   // if (data.StyleList) {
  //   //   var styleList = data.StyleList;
  //   //   (data.DataList || data.WallArray || []).forEach((item, index) => {
  //   //     Object.assign(item, styleList[index])
  //   //   })
  //   // }
  //   // var _data = this.__hideThumbImage(data.DataList || data.WallArray || []);
  //   // this.cacheDataList = this.cacheDataList.concat(_data);
  // },

  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(data || []);
    if (obj.dataList.length < 16) {
      obj.LoadingText = obj.dataList.length === 0 ? '暂无相关推荐' : '';
    }
    obj.LoadingText = '';
    this.__reSetData(obj);
  },
  onLoad(options) {
    var obj ={};
    if (this.data.isGetFormId !== util.isGetFormId) {
      this.setData({
        isGetFormId: util.isGetFormId
      })
    }
    if (util.isEmpty(util.setting)) {
      return util.settingPromise.then(res => {
        this.onLoad(options);
      });
    }
    var isHideGuide = util.getStorageSync('guide');
    if (!isHideGuide) {
      if (!util.setting.IsClose) {
        this.setData({
          isHideGuide: false
        })
      }
    }
    if (util.setting.SharingUnlockCount) {
      obj.isShareUnlock = true
    }
    obj.isClose = util.setting.IsClose;
    obj.appid = util.appType;
    if (options.scene) {
      var [id, isPay = 0, suffix = 'bz', IsUserUpload = 0] = options.scene.split('_');
      this.suffix = suffix;
      return util.request({
        url: suffix === 'bz' ? 'List/WallpaperInfo' : 'List/EmojiPortraitInfo',
        data: {
          picID: id,
          ID: id,
          isPay,
          isUserUpload: IsUserUpload
        }
      }).then(res => {
        dataItem = res.Data;
        dataList = [dataItem];
        this.data.imgList = dataList;
        if (this.suffix === 'bz') {
          dataItem.noBuy = dataItem.PriceType && !util.toggle('rewardStr').has(dataItem.PicInfoID) ? !0 : !1;
        }
        obj.imgList = dataList;
        obj[`loadingArr[0]`] = true;
        obj.suffix = this.suffix
        this.__checkImage(0, obj);
        this.setData(obj);
        this.__createRelativesByName('baseData');
        this.index = 0;
        this.__addProperties();
        this.setData({
          baseData: this.data.baseData
        });
        this.__getRelative();
      })

    }
    var startIndex = +options.index,//点击的图片索引
        realyIndex = startIndex,
        currentIndex = Number(options.current) || 0,
        page = util.page,
        imgList = page.dataList.slice(realyIndex, realyIndex + secItemCount),
        a;
    this.suffix = options.suffix || 'bz';
    this.page = page;
    obj.imgList = imgList;
    obj[`loadingArr[${currentIndex}]`] = true;
    if (currentIndex !== 0) obj.currentIndex = currentIndex;  
    obj.suffix = this.suffix;
    if (page.hasNext){
      let len = page.dataList.length - startIndex;
      if (len < secItemCount) this.getMore().then(this.onLoad.bind(this, options));
      else if (len  < secItemCount * 2){
        this.getMore();
      }
    }
    this.data.imgList = imgList;
    this.__checkImage(currentIndex, obj);
    this.setData(obj);
    this.loadingIndex = realyIndex;
    this.startIndex = startIndex;
    this.realyIndex = realyIndex;
    this.currentIndex = currentIndex;
    this.secIndex = -1;
    this.__createRelativesByName('baseData');
    this.index = 0;
    this.__addProperties();
    this.setData({
      baseData: this.data.baseData
    });

    this.__getRelative();
    return;
    var dataList, relative, dataItem;
    if (options.scene){
      var [id, isPay = 0, suffix = 'bz', IsUserUpload = 0] = options.scene.split('_');
      this.suffix = suffix;
      util.request({
        url: suffix === 'bz' ? 'List/WallpaperInfo':'List/EmojiPortraitInfo',
        data:{
          picID:id,
          ID: id, 
          isPay,
          isUserUpload: IsUserUpload
        }
      }).then(res=>{
        dataItem = res.Data;
        dataList = [dataItem];
        if (this.suffix === 'bz') {
          dataItem.noBuy = dataItem.PriceType && !util.toggle('rewardStr').has(dataItem.PicInfoID) ? !0 : !1;
        }
        relative = {
          baseData: {
            hasNext: !1, pageIndex: 0, filterStr: ''
          }
        }
        this.onLoaded(dataList, relative);
        dataList = relative = dataItem = null;
      })

    } else {
      this.suffix = options.suffix || 'bz';
      ({ dataList, ...relative } = util.relative);
      this.onLoaded(dataList,relative,options.current);
      util.relative = dataList = relative = dataItem = null;
    }
  },
  guideNext(){
    this.setData({
      isHideGuide: true
    });
    util.setStorage({
      key: "guide",
      data: 1
    });
  },
  
  onLoaded(dataList, relative,index=0){
    var obj = {};
    // this.collectStr = util.getStorageSync('collectStr-' + this.suffix);
    // util.toggle('collectStr-' + this.suffix);
    // this.downloadStr = util.getStorageSync('downloadStr-' + this.suffix);
    // this.rewardStr = util.getStorageSync('rewardStr');
    this.index = index;
    if (dataList.length < 7 && index > 0) {
      obj.currentIndex = index;
      this.currentIndex = index;
    }
    obj[`loadingArr[${index}]`] = true;

    if (util.setting.SharingUnlockCount) {
        obj.isShareUnlock = true
    }
    obj.isClose = util.setting.IsClose;
    obj.appid = util.appType;
    Object.assign(this, relative);
    this.__addProperties();
    this.__getRelative();
    
    this.cacheDataList = dataList;
    if (dataList[0].CategoryID) {
      obj.isShow2INOTCH = !0;
    }
    // if (this.suffix !== 'bz') {
    //   obj.isAvatarEmote = !0
    // }
    if (getCurrentPages().length === 1) {
      obj.isShareEntry = !0
    }
    obj.suffix = this.suffix;
    this.__loadMore(obj);
    this.__reSetData(obj);
    obj = {};
    this.__checkImage(index, obj);
    this.__reSetData(obj);

  },
  onHide() {
    // if (this.timeid){
    //   clearTimeout(this.timeid);
    // }
    // console.log('hide', this.timeid)
  },
  toINOTCH() {
    var dataItem = this.dataList[this.currentIndex];
    util.toINOTCH(null, dataItem)
  },
  openSuccessTip(successText){
    var obj = {
      isShowSuccess: true,
      successText: successText,
    }
    if (this.data.successWidth){
      this.setData(obj);
      obj = null;
      this.timer = setTimeout(() => {
        this.closeSuccessTip()
      }, 20000)
    }else{
      util.getRect('.ad-view').then(res => {
        console.log(res)
        obj.successWidth = res.width
        this.setData(obj);
        obj = null;
        this.timer = setTimeout(() => {
          this.closeSuccessTip()
        }, 20000)
      })
    }
  },
  closeSuccessTip(){
    this.setData({
      isShowSuccess:false,
      adSwitchFlag: !this.data.adSwitchFlag
    });
    if(this.timer){
      clearTimeout(this.timer)
    }
  },
  closeFreeUnlock(){
    this.setData({
      isShowFreeUnlock: false
    });
  },
  downloadInit(){
    var dataItem = this.data.imgList[this.currentIndex];
    if (util.setting.LimitCount && this.suffix === 'bz'){
      var dayLimit = util.dayLimit('downloadCount', util.setting.LimitCount);
      if (!dayLimit.has(dataItem.PicInfoID) && dayLimit.isExceed) {
        this.setData({
          isShowFreeUnlock: true,
          freeCount: dayLimit.LimitCount
        })
        return;
      }
    }
    this.downloadHandle(dataItem);
  },
  downloadHandle(dataItem) {
    dataItem = dataItem || this.data.imgList[this.currentIndex];
    // var isCanLimitDownload = this.isCanLimitDownload(dataItem)
    // if (isCanLimitDownload && this.downloadInfo.count >= util.setting.AdInfo.LimitCount) {
    //   var obj = { is_p_ad_show: true };
    //   if (!this.data.adid) {
    //     obj.adid = util.setting.AdInfo.BroadPointID
    //     obj.limitCount = util.setting.AdInfo.LimitCount
    //   }
    //   return this.setData(obj)
    // }
    wx.showLoading({ title: '正在下载图片', mask: !0 });
    var url = (dataItem.Image || dataItem.ThumbImage).replace('http', 'https');
    var _id = dataItem.PicInfoID || dataItem.ID;
    
    new Promise((resolve, reject) => {
      // 下载图片
      wx.downloadFile({
        url,
        success: resolve,
        fail: reject
      });
    }).then((res) => {
      return new Promise((resolve, reject) => {
        // 保存图片到相册
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: resolve,
          fail: reject
        })
      })
    }).then((res) => {
      // wx.hideLoading();
      // 保存下载数据
      var downloadData = util.getStorageSync('downloadData-' + this.suffix) || [];
      // dataItem = JSON.parse(JSON.stringify(dataItem));
      downloadData.unshift(dataItem);
      if (downloadData.length > 150) {
        downloadData.pop();
      }
      util.setStorage({
        key: "downloadData-" + this.suffix,
        data: downloadData
      })
      // if (isCanLimitDownload) {
      //   this.downloadInfo.count++;
      //   this.downloadInfo.idsStr += _id + ';';
      //   this.saveDownloadInfo();
      // }
      // setTimeout(() => {
      //   util.msg('下载图片成功!');
      // }, 0)
      this.popupTip(_id,'下载');
    
      dataItem.PriceType = dataItem.PriceType || 0;
      if (this.suffix == 'bz' && dataItem.PriceType == 0 && util.setting.LimitCount){
        util.dayLimit('downloadCount').countByKey(_id);
      }
      dataItem = null;
    }).catch((e) => {
      dataItem = null;
      wx.hideLoading();
      var _this = this;
      if (e.errMsg.indexOf('auth') > -1) {
        wx.showModal({
          title: '授权失败',
          content: '您还未授权，这将影响您的使用体验，是否重新设置授权？',
          cancelText: '否',
          confirmText: '是',
          success(res) {
            if (res.confirm) {
              return wx.openSetting({
                success: function (res) {
                  if (res.authSetting['scope.writePhotosAlbum']) {
                    return _this.downloadHandle();
                  }
                }
              })
            }
          }
        });
      } else {
        wx.showModal({
          title: '下载失败',
          content: '请直接点击图片，并' + util.platform === 'android' ? '点击右上角，选择保存图片' : '长按保存图片',
          // content: '再修复之前，请先直接点击图片，并' + util.platform === 'android' ? '点击右上角，选择保存图片' : '长按保存图片' + '错误信息：' + e.errMsg + '，图片id：' + _id + '，请截图反馈，给您带来的麻烦敬请谅解,我们会尽快修复！' + util.info,
          showCancel: false,
          confirmText: '确定'
        })
      }
      console.log('失败', e)
    });
  },
  popupTip(id,_type){
    var dayLimit = util.dayLimit('AdPopupCount', util.setting.AdPopupCount);
    var id = `${this.suffix}${id}`;
    if (util.setting.AdPopupCount && !dayLimit.has(id) && dayLimit.isExceed) {
      wx.hideLoading();
      this.openSuccessTip(_type);
    } else {
      setTimeout(() => {
        util.msg(_type+'成功!');
      }, 0)
      dayLimit.countByKey(id)
    }
    dayLimit = null;
  },
  collectHandle() {
    if (this.isLoading) return;
    this.isLoading = !0;
    var obj = {}, isCollected = !this.data.isCollected, collectTxt = this.data.collectTxt, interfaceName, _data, _id, isUserUpload = 0;
    obj.isCollected = isCollected;
    obj.collectTxt = isCollected ? '取消收藏' : '收藏';
    wx.showLoading({ title: `正在${isCollected ? '收藏' : '取消收藏'}图片`, mask: !0 });
    if (this.suffix === 'bz') {
      interfaceName = isCollected ? 'list/collect' : 'list/cancelcollect';
      

      let { PicInfoID, IsUserUpload} = this.data.imgList[this.currentIndex];
      _id = PicInfoID;
      isUserUpload = IsUserUpload
      _data = {
        picInfoID:PicInfoID, 
        userID: app.userInfo.userID,
        isUserUpload
      }
    } else {
      interfaceName = 'list/networkpiccollect';
      _id = this.data.imgList[this.currentIndex].ID;
      if(_id === undefined){
        wx.reportAnalytics('error', {
          page: '',
          face: JSON.stringify(this.data.imgList[this.currentIndex]),
          target: 'networkpiccollect',
        });
      }
      _data = {
        id: _id,
        userID: app.userInfo.userID,
        'type': this.suffix === 'bq' ? 1 : 3,
        isCollection: isCollected ? 1 : 0
      }
    }
    this.__reSetData(obj);
    util.request({ url: interfaceName, data: _data })
      .then((res) => {
        if (isUserUpload == 1){
          util.toggle('collectStr-sc').add(_id);
        }else{
          util.toggle('collectStr-' + this.suffix).add(_id);
        }
        
        // if (isCollected) {
        //   this.collectStr = this.collectStr + ',' + _id;
        // } else {
        //   this.collectStr = this.collectStr.replace(',' + _id, '')
        // }
        // util.setStorage({
        //   key: "collectStr-" + this.suffix,
        //   data: this.collectStr
        // })

        this.popupTip(_id, collectTxt);
        // util.msg(collectTxt + '成功!');
        // this.openSuccessTip(collectTxt);
        // wx.hideLoading();
        this.isLoading = !1;
      })
      .catch(() => {
        obj.isCollected = !isCollected;
        obj.collectTxt = collectTxt;
        this.__reSetData(obj);
        wx.hideLoading();
        util.msg(collectTxt + '失败!', 1);
        this.isLoading = !1;
      });
  },
  openBuyPanel() {
    var obj = {
      isHideBuyPanel: !1
    },
      dataItem = this.data.imgList[this.currentIndex];
    if (dataItem.AuthorName !== this.data.AuthorName) {
      ({ AuthorAvatar: obj.AuthorAvatar, AuthorName: obj.AuthorName } = dataItem);
      obj.PriceType = dataItem.PriceType.toFixed(1);
    }
    this.setData(obj);
  },
  closeBuyPanel() {
    this.setData({
      isHideBuyPanel: !0
    });
  },

  pay() {
    if (this.isLoading) return;
    this.isLoading = !0;
    var currentIndex = this.currentIndex;
    var dataItem = this.data.imgList[currentIndex];
    var _id = dataItem.PicInfoID;
    util.request({ url: 'list/minippayorder', data: { userID: app.userInfo.userID, picInfoID: _id } })
      .then((res) => {
        return this.requestPayment(res.Data.PayData)
      }).then((res) => {

        util.toggle('rewardStr').onlyAdd(_id);
        util.msg('支付成功！')
        this.setData({
          isHideBuyPanel: !0,
          noBuy: !1
        });
        dataItem.noBuy = !1;
        this.downloadHandle();
        this.isLoading = !1;
        console.log('支付成功', res)
      })
      .catch((e) => {
        util.msg('支付失败！', 1);
        this.isLoading = !1;
      })
  },
  downloadLimit(){
    util.dayLimit('downloadCount').LimitCount = 1000;
    this.closeFreeUnlock();
    this.downloadHandle();
  },
  shareReward(){
    if (!util.setting.SharingRewards) return;
    var dayLimit = util.dayLimit('shareReward', util.setting.SharingRewards);
    if (dayLimit.isExceed) {
      return;
    }
    util.request({
      url: 'List/SharingRewardsPic',
      data: {
        userID: app.userInfo.userID,
      }
    }).then(res => {
      // rewardWallPaper
      if (res.Data == null){
        dayLimit.currentCount = dayLimit.LimitCount;
        dayLimit = null;
        return;
      }
      var { PicInfoID, PriceType, Image} = res.Data;
      res.Data.show = true;
      res.Data.remain = dayLimit.remain;
      res.Data.PriceType = res.Data.PriceType.toFixed(2)
      this.setData({
        rewardWallPaper: res.Data
      })
      console.log(res.Data)
      // dayLimit.currentCount = res.Data;
      // util.show(`今日分享解锁已用${dayLimit.currentCount}次,还剩${dayLimit.remain}次`, '解锁成功');
      dayLimit = null;
    }).catch(e => {
      // if (e.errMsg === '已超出当天解锁限制') {
      //   dayLimit.currentCount = dayLimit.LimitCount;
      //   this.shareUnlock()
      // }
      dayLimit = null;
    })
  },
  closeRewardPopup(){
    this.setData({
      ['rewardWallPaper.show']: false
    });
  },
  clickReceive(){
    var { PicInfoID } = this.data.rewardWallPaper;
    var dayLimit = util.dayLimit('shareReward');
    util.request({
      url: 'List/SharingUnlockPic',
      data: {
        picID: PicInfoID,
        userID: app.userInfo.userID,
        unlockType: 2
      }
    }).then(res=>{
      dayLimit.currentCount = res.Data;
      this.setData({
        ['rewardWallPaper.show']:false
      });
      util.toggle('rewardStr').onlyAdd(PicInfoID);
      this.downloadHandle(this.data.rewardWallPaper);
      dayLimit = null;
    })
  },
  shareUnlock(){
    if (!this.data.isShareUnlock){
      return;
    }
    var dayLimit = util.dayLimit('shareUnlock', util.setting.SharingUnlockCount);  
    if(dayLimit.isExceed){
      util.show(`今日分享解锁${dayLimit.LimitCount}次机会已全部用完`, '解锁失败')
      return;
    }
    var currentIndex = this.currentIndex;
    var dataItem = this.data.imgList[currentIndex];
    var _id = dataItem.PicInfoID;
    util.request({
      url: 'List/SharingUnlockPic',
      data: {
        picID: _id,
        userID: app.userInfo.userID,
        unlockType: 1
      }
    }).then(res=>{
      dayLimit.currentCount = res.Data;
      
      util.show(`今日原创专栏分享解锁次数还剩${dayLimit.remain}次`, '解锁成功');
      util.toggle('rewardStr').onlyAdd(_id);
      this.setData({
        noBuy: !1
      });
      dataItem.noBuy = !1;
      dayLimit = null;
      dataItem = null;
    }).catch(e => {
        if (e.errMsg === '已超出当天解锁限制') {
          dayLimit.currentCount = dayLimit.LimitCount;
          this.shareUnlock()
        }
        dayLimit = null;
        dataItem = null;
    })
  },
  requestPayment({ Package, Noncestr, Timestamp, SignType, Sign }) {
    return new Promise((resolve, reject) => {
      wx.requestPayment({
        'timeStamp': Timestamp,
        'nonceStr': Noncestr,
        'package': Package,
        'signType': SignType,
        'paySign': Sign,
        'success': resolve,
        'fail': reject
      })
    })
  },

  previewImage() {
    var dataItem = this.data.imgList[this.currentIndex];
    // var isCanLimitDownload = this.isCanLimitDownload(dataItem)
    // if (isCanLimitDownload && this.downloadInfo.count >= util.setting.AdInfo.LimitCount) {
    //   var obj = { is_p_ad_show: true };
    //   if (!this.data.adid) obj.adid = util.setting.AdInfo.BroadPointID;
    //   return this.setData(obj)
    // }
    if (!dataItem.noBuy) {
      wx.previewImage({
        urls: [dataItem.Image]
      })
    }
  },
  longpressHandle(e) {
    var PicInfoID = this.data.imgList[this.currentIndex].PicInfoID;
    wx.showModal({
      title: '壁纸id',
      content: '' + PicInfoID,
      showCancel: false
    })
  },
  __init() {

  },
  __checkImage(index, obj) {
    var { PicInfoID, noBuy = !1, ID, IsUserUpload = 0 } = this.data.imgList[index], isCollected;
    if (IsUserUpload == 1){
      isCollected = util.toggle('collectStr-sc').has(PicInfoID || ID);
    }else{
      isCollected = util.toggle('collectStr-' + this.suffix).has(PicInfoID || ID);
    }
    if (this.data.noBuy !== noBuy) {
      obj.noBuy = noBuy;
    }
    if (this.data.isCollected !== isCollected) {
      obj.isCollected = isCollected;
      obj.collectTxt = isCollected ? '取消收藏' : '收藏';
    }
  },

  // __reSetData(obj) {
  //   clearTimeout(this.timer);
  //   for (var key in obj) {
  //     if ('dataListLoadingTextErrorscollTop'.indexOf(key) > -1) {
  //       obj[this.dynamicKey + key] = obj[key];
  //       delete obj[key];
  //     }
  //   }
  //   this.obj = this.obj ? Object.assign(this.obj, obj) : obj;
  //   this.timer = setTimeout(() => {
  //     this.setData(this.obj);
  //     this.obj = null;
  //   }, 50);
  // },
  __hideThumbImage(dataList) {
    if (this.suffix === 'bz') {
      let reward = util.toggle('rewardStr');
      dataList.forEach((item) => {
        item.hideThumbImage = !0
        if (item.PriceType && !reward.has(item.PicInfoID)) {
          item.noBuy = !0
        }
      })
    } else {
      dataList.forEach((item) => {
        item.hideThumbImage = !0
      })
    }
    return dataList;
  },
  onShareAppMessage(shareEvent) {
    var obj = util.share();
    obj.path = this.route;
    var { PicInfoID, Image, Title, PriceType = 0, ID, IsUserUpload = 0 } = this.data.imgList[this.currentIndex];
    obj.path = `${this.route}?scene=${PicInfoID || ID}_${PriceType && 1}_${this.suffix}_${IsUserUpload}`;
    obj.imageUrl = `${util.base}WeChat/GenerateSharePicStream?picType=${this.suffix === "bz" ? 1 : 2}&picUrl=${encodeURIComponent(Image)}`;
    obj.title = Title.replace(/\d+/g, '');
    if (shareEvent.from === 'button'){
      obj.success = (e)=>{
        switch (shareEvent.target.dataset.type){
          case '0':
            this.downloadLimit();
          break;
          case '1':
            this.shareUnlock();
          break;
          case '2':
            this.shareReward()
        }
        shareEvent = null;
      }
      obj.fail = (e) => {
        console.log(e)
      }
    }

    console.log('转发', obj.path)
    this.copySharelink(obj.path);
    return obj;
  },

});

Page(Preview)
