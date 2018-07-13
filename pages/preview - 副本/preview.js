'use strict';
var app = getApp();
var { Basic } = require('../../utils/basic');
var { util } = require('../../utils/util');
var { Poster } = require('../../utils/poster');
var Preview = new Basic();
Preview.expend(Poster,{
  dataName:'baseData',
  currentIndex:0,
  data: {
    currentIndex: 0,
    baseData: {
      dataList: []
    },
    imgList:[],
    loadedArr: [],
    loadingArr: [],
    collectTxt: '收藏',
    isCollected: !1,
    noBuy: !1,
    isHideBuyPanel: !0,
    AuthorAvatar: 'https://minibizhi.313515.com/BiZhiStatic/default.svg',
    AuthorName: '',
    PriceType: 0.0,
    isShow2INOTCH: false,
    // is_p_ad_show: false,
    circular: true,//是否采用衔接滑动
    rewardWallPaper:{},
    isShowSuccess:false,
    successText:'下载',
    successWidth:'',
    adSwitchFlag:false,
    isShowFreeUnlock:false,
    isHideGuide:true
  },
  onShow(){
    if (this.data.isShowSuccess){
      this.closeSuccessTip()
    }
  },
  onLoad(options) {
    if (this.data.isGetFormId !== util.isGetFormId) {
      this.setData({
        isGetFormId: util.isGetFormId
      })
    }
    if (util.isEmpty(util.setting)){
      util.settingPromise.then(res=>{
        this.onLoad(options);
      });
      return;
    }

    var isHideGuide = util.getStorageSync('guide');
    if (!isHideGuide) {
      if (!util.setting.IsClose){
        this.setData({
          isHideGuide:false
        })
      }
    }
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

  wallpaperPoster(Labels,wallpaper,qrcode,width=466,height=773){
    // console.log(wallpaper, qrcode);
    // return
    const ctx = this.ctx || (this.ctx = wx.createCanvasContext('myCanvas'));
    //画背景
    console.log('画背景');
    ctx.drawImage('../../res/poster-bg1.png', 0, 0);
    
    //画壁纸
    console.log('画壁纸');
    ctx.drawImage(wallpaper.path, 100, 100, 268, 268 * wallpaper.height / wallpaper.width)
    
    //画手机壳
    console.log('画手机壳');
    ctx.drawImage('../../res/phone.png', 83, 42);

    //画底部白色区域
    console.log('画底部白色区域');
    ctx.beginPath();
    ctx.moveTo(0, 538);
    ctx.quadraticCurveTo(width / 2, 470, width, 538);
    ctx.lineTo(width, height);
    ctx.lineTo(0, height);
    ctx.closePath();
    ctx.setFillStyle('white');
    ctx.fill();
    // 画二维码
    console.log('画二维码');
    ctx.drawImage(qrcode.path, 46, 606, 132,132)
    // 画文字
    console.log('画文字');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.fillStyle = '#4c4c4c'
    ctx.font = 'normal bold 28px sans-serif'
    ctx.fillText(util.appType === 0 ? '壁纸精选' : (util.appType === 2 ? '高清壁纸' : '哎喔壁纸'), 198, 656);
    ctx.restore();
    ctx.fillStyle = '#1DB18C'
    ctx.setFontSize(20);
    ctx.fillText('长按识别免费下载该壁纸', 198, 694);
    // 画便签
    console.log('画便签');
    ctx.setFontSize(20);
    var y = 540;
    var total = 0;//总长度
    var r = 20;
    if(Labels){
      Labels = Labels.split(',').slice(0,3).map(item=>{
        var len = ctx.measureText(item).width;
        var x = total + r;
        // 文字长度 + 左右圆弧半径 + 一个间隔
        total += len + r * 2 +16;
          return {
            x,
            len,
            txt:item,
            color: util.randomColor()
          }
      });
      var left = 466 - total + 16 >> 1;//多减了一个间隔 除2
      Labels.forEach(item=>{
        var x = left + item.x;
        ctx.beginPath();
        ctx.moveTo(x, y + 2*r);
        ctx.arc(x, y + r, r, 0.5 * Math.PI, 1.5 * Math.PI);
        ctx.lineTo(x + item.len, y);
        ctx.arc(x + item.len, y + r, r, 1.5 * Math.PI, 0.5 * Math.PI);
        ctx.closePath();
        ctx.setStrokeStyle(item.color)
        ctx.stroke();
        ctx.fillStyle = item.color
        ctx.fillText(item.txt, x, y+r);
      })
    }
    ctx.draw(false, () => {
      console.log('画完成，准备生成图片')
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        success:res=>{
          this.setData({
            poster:res.tempFilePath
          })
        }
      })
    });
  },
  avatarEmotePoster(Labels,avaterEmote, qrcode, width = 466, height = 773){
    const ctx = this.ctx || (this.ctx = wx.createCanvasContext('myCanvas'));
    //画背景
    console.log('画背景');
    ctx.drawImage('../../res/poster-bg2.png', 0, 0);
    //画文字
    console.log('画文字');
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.save();
    ctx.fillStyle = '#4c4c4c'
    ctx.font = 'normal bold 28px sans-serif'
    ctx.fillText(util.appType === 0 ? '壁纸精选' : (util.appType === 2 ? '高清壁纸' : '哎喔壁纸'), 198, 656);
    
    ctx.fillStyle = '#004D39'
    ctx.setFontSize(37);
    ctx.fillText(this.suffix === 'tx'?'头像专区':'表情专区', 58, 82);
    ctx.restore();

    ctx.fillStyle = '#1DB18C'
    ctx.setFontSize(20);
    ctx.fillText('长按识别免费下载该' + (this.suffix === 'tx' ? '头像' : '表情'), 198, 694);
    // 画标签
    var x = 56, r = 20, y = 140;
    var txt = Labels.split(',')[1] || Labels.split(',')[0]
    if(txt){
      let len = ctx.measureText(txt).width
      ctx.beginPath();
      ctx.moveTo(x + r, y + 2 * r);
      ctx.arc(x + r, y + r, r, 0.5 * Math.PI, 1.5 * Math.PI);//左半圆
      ctx.lineTo(x + r + len, y);
      ctx.arc(x + r + len, y + r, r, 1.5 * Math.PI, 0.5 * Math.PI);
      ctx.closePath();
      ctx.setFillStyle('#ffffff')
      ctx.fill();
      ctx.fillStyle = '#004D39'
      ctx.fillText(txt, x+r, y + r);
    }
    // 画二维码
    console.log('画二维码');
    ctx.drawImage(qrcode.path, 46, 606, 132, 132)

    //画头像或表情
    console.log('画头像或表情');
    y = 205;
    r=24;
    var w = 364;
    ctx.save()
    ctx.beginPath()
    ctx.moveTo(x, y + r);
    ctx.arc(x+r, y+r, r, Math.PI, 1.5 * Math.PI);//左上角圆角
    ctx.lineTo(x + w - r,y);
    ctx.arc(x + w - r, y + r, r, 1.5 * Math.PI, 0)//右上角圆角
    ctx.lineTo(x + w, y + w-r);
    ctx.arc(x + w - r, y + w - r, r, 0,0.5 * Math.PI)//右下角圆角
    ctx.lineTo(x + r, y + w);
    ctx.arc(x + r, y + w - r, r, 0.5 * Math.PI, Math.PI)//左下角圆角
    ctx.closePath();
    ctx.clip()
    ctx.drawImage(avaterEmote.path, x, y,w,w)
    ctx.restore()
    ctx.draw(false, () => {
      console.log('画完成，准备生成图片')
      wx.canvasToTempFilePath({
        canvasId: 'myCanvas',
        success: res => {
          this.setData({
            poster: res.tempFilePath
          })
        }
      })
    });
  },

  // setVip() {
  //   this.downloadInfo.isVip = true;
  //   this.saveDownloadInfo();
  //   // this.timeid = setTimeout(() => {
  //   //   this.setData({
  //   //     is_p_ad_show: false
  //   //   })
  //   //   util.msg('解锁成功!')
  //   // }, 1000)
  // },
  // close_p_ad() {
  //   this.setData({
  //     is_p_ad_show: false
  //   })
  // },
  // onShow() {
  //   if (this.data.is_p_ad_show) {
  //     this.setData({
  //       is_p_ad_show: false
  //     })
  //     setTimeout(() => {
  //       util.msg('解锁成功!')
  //     }, 500)
  //   }
  // },
  onHide() {
    // if (this.timeid){
    //   clearTimeout(this.timeid);
    // }
    // console.log('hide', this.timeid)
  },
  // isCanLimitDownload(dataItem) {
  //   //存在限制 今天没有点击过广告 并且是免费壁纸时   需要限制下载数量 点击广告解锁
  //   return util.setting.AdInfo && !this.downloadInfo.isVip && this.suffix === 'bz' && dataItem.PriceType === undefined && this.downloadInfo.idsStr.indexOf(dataItem.PicInfoID) === -1;
  // },
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
    var dataItem = this.dataList[this.currentIndex];
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
    dataItem = dataItem || this.dataList[this.currentIndex];
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
      let { PicInfoID, IsUserUpload} = this.dataList[this.currentIndex];
      _id = PicInfoID;
      isUserUpload = IsUserUpload
      _data = {
        picInfoID:PicInfoID, 
        userID: app.userInfo.userID,
        isUserUpload
      }
    } else {
      interfaceName = 'list/networkpiccollect';
      _id = this.dataList[this.currentIndex].ID;
      if(_id === undefined){
        wx.reportAnalytics('error', {
          page: '',
          face: JSON.stringify(this.dataList[this.currentIndex]),
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
      dataItem = this.dataList[this.currentIndex];
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
    var dataItem = this.dataList[currentIndex];
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
    var dataItem = this.dataList[currentIndex];
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

  // 图片加载完成
  loadedHandle(e) {
    var index = e.target.dataset.index;
    var obj = {};
    if (index === this.index) {
      obj[`loadingArr[${index}]`] = !0
    }
    obj['loadedArr[' + index + ']'] = !0;
    this.__reSetData(obj);
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

  change(e) {
    var obj = {};
    var currentIndex = e.detail.current;
    if (!this.data.loadingArr[currentIndex + 1]){
      obj['loadingArr[' + (currentIndex + 1) + ']'] = !0;
    }
    if (!this.data.loadingArr[currentIndex]) {
      obj['loadingArr[' + (currentIndex) + ']'] = !0;
    }
    obj.poster = null;
    if (this.len - currentIndex < 5) {
      this.__loadMore(obj, 30);
    }
    this.__checkImage(currentIndex, obj);
    this.__reSetData(obj);
    this.currentIndex = currentIndex;
  },
  previewImage() {
    var dataItem = this.dataList[this.currentIndex];
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
    var PicInfoID = this.dataList[this.currentIndex].PicInfoID;
    wx.showModal({
      title: '壁纸id',
      content: '' + PicInfoID,
      showCancel: false
    })
  },
  __init() {

  },
  __loadMore(obj, count = 10) {
    var res = this.__filterTheSame(this.cacheDataList.splice(0, count));
    obj.dataList = this.dataList.concat(res);
    this.len = obj.dataList.length;
    if (this.cacheDataList.length < 10 && this.hasNext) {
      this.__getData();
    }
  },
  __checkImage(index, obj) {
    var { PicInfoID, noBuy = !1, ID, IsUserUpload = 0 } = this.dataList[index], isCollected;
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
  __dealWithData(data) {
    if (data.StyleList) {
      var styleList = data.StyleList;
      (data.DataList || data.WallArray || []).forEach((item, index) => {
        Object.assign(item, styleList[index])
      })
    }
    var _data = this.__hideThumbImage(data.DataList || data.WallArray || []);
    this.cacheDataList = this.cacheDataList.concat(_data);
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
    var { PicInfoID, Image, Title, PriceType = 0, ID, IsUserUpload = 0 } = this.dataList[this.currentIndex];
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

  __getParam() {
    return Object.assign({
      pageindex: this.pageIndex,
      pagesize: this.pageSize
    }, this.params)
  }
});

Page(Preview)
