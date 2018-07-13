const sign = require('sign.js');
var fn = require('fn');
import toggle from 'toggle';
import dayLimit from 'dayLimit';
//默认属性
var util = {
  base: 'https://minibizhi.313515.com/',
  version: 2.5,
  appType: 0,//0壁纸精选  1 哎喔壁纸  2高清壁纸
  LoadingText: '请稍等,正在加载中...',
  ErrorText: '数据加载失败',
  NoMoreDataText: '到底啦！',
  collectStr: '',
  downloadStr: '',
  rewardStr: '',
  // payIndexArr: [],
  setting: {},
  isNotify: !0,
  preCommentTime:0,
  collectCount:0,
  ...fn,
  toggle,
  dayLimit,
  init() {
    this.getDeviceInfo();
    // this.isGetFormId = this.getToday() !== this.getStorageSync('date');
    util.isGetFormId = !util.dayLimit('formID',3).isExceed;
    this.isNotify = util.getStorageSync('isNotify') !== false;
    // this.toMiniProgramPromise = this.getMiniProgram();
    this.settingPromise = this.getSetting();
    this.toggleCopyFlag = util.getStorageSync('toggleCopyFlag') * 1;
    this.ad = this.getAd();
  },
  getAd(){
    return util.request({ url: '/List/AdInfoList' }).then(res => {
      var obj = {};
      res.Data.forEach((item,index)=>{
        switch (item.AdPositionID) {
          case 10001://导航栏广告
            obj[item.AdPositionID] = {
              SwitchTime: item.SwitchTime * 1000,
              adList: item.MiniAdInfoList.map(item => {
                return item.MiniAdInfoList
              })
            }
          break;
          // case 10002://悬浮窗广告位

          // break;
          // case 10003://分类标签广告
          // break;
          case 10004://小卡片广告
            obj[item.AdPositionID] = item.MiniAdInfoList.length > 0 ? item.MiniAdInfoList[0].MiniAdInfoList : []
          break;
          case 10005://信息流广告
            if (item.MiniAdInfoflow && item.MiniAdInfoflow.MiniAdInfoList){
              var position = [];
              var Row = item.MiniAdInfoflow.AdPositionInfoList[0].Rows;
              // position.push(Row)
              item.MiniAdInfoflow.AdPositionInfoList.reduce((Row, currentValue) => {
                position.push(Row * 3);
                return Row + currentValue.Rows
              }, Row)
              obj[item.AdPositionID] = {
                adList: item.MiniAdInfoflow.MiniAdInfoList,
                position
              }
            }
          break;
          default:
            obj[item.AdPositionID] = {
              SwitchTime: item.SwitchTime * 1000,
              adList: item.MiniAdInfoList.length > 0 ? item.MiniAdInfoList[0].MiniAdInfoList : []
            }
        }
        // console.log(item)
      })
      return obj;
    }).catch(e=>{
      console.log(e)
    })
  },
  getSetting() {
    return util.request({ url: "list/Init", data: {} }).then(res => {
      this.setting = res.Data;
      this.isGetFormId = !this.dayLimit('formID', this.setting.ReportTimes).isExceed;
      // this.settingPromise = null;
      return this.setting
    });
  },
  share(path) {
    return {
      title: '壁纸精选',
      desc: '换一张壁纸，换一种心情',
      path: path || this.route
    }
  },
  request(obj, noRequestTask) {
    return new Promise((resolve, reject) => {
      var sub = obj.filePath ? 'formData' : 'data',
        data = obj.data || {};
      delete obj.data;

      if (!/^https/.test(obj.url)){
        obj.url = this.base + obj.url;
      }
      obj.header = {
        // 'content-type': 'application/json',
        'deviceInfo': this.deviceInfo
      }
      obj[sub] = data;
      obj[sub].SignatureMD5 = sign.params(obj[sub]).SignatureMD5;
      obj.success = resolve;
      obj.fail = reject;
      if (noRequestTask){
        return obj.filePath ? wx.uploadFile(obj) : wx.request(obj);
      }
      this.requestTask = obj.filePath ? wx.uploadFile(obj) : wx.request(obj);
    }).then((res) => {
      this.requestTask = null;
      // if (obj.url === 'https://minibizhi.313515.com/List/SelectionList?SignatureMD5=a990183b70cd401fa15382bfc4a6c355'){
      //   return res
      // }
      if (res.statusCode === 200 && typeof res.data === 'string') {
        res.data = JSON.parse(res.data);
      }
      if (res.statusCode === 200 && res.data.ResultCode === '0') {
        return res.data;
      } else {
        throw { errMsg: res.statusCode !== 200 ? res.statusCode.toString() : res.data.ResultMessage, origin: 'server' };
      }
    })
  },
  abort(){
    if (this.requestTask) this.requestTask.abort();
  },
  getUrlSearch(obj){
    var search = '?'
    for(var key in obj){
      search += key + '=' + obj[key] + '&'
    }
    return search + 'SignatureMD5=' + sign.params(obj).SignatureMD5;
  },
  getDeviceInfo() {
    //获取设备信息
    var { windowHeight, brand, language, model, pixelRatio, version, windowWidth, platform, system, SDKVersion, screenWidth, statusBarHeight,screenHeight} = wx.getSystemInfoSync();
    // model ='iPhone X'
    let _this = this;
    let deviceInfoObj = {
      "CH": 1,
      "PID": this.appType + 1,
      // "UserId": 1,
      "Ver": 6,
      "Height": windowHeight,
      "Lang": language,
      "Model": model,//iPhone X
      "Net": 'unknown',
      "PixelRatio": pixelRatio,
      "Version": version,
      "Width": windowWidth,
      // "appVersion":2.5
    }

    // this.widthrpx = 750/windowWidth;
    this.ratio2px = 750 / windowWidth;
    // this.px2ratio = windowWidth / 750;
    this.windowWidth = windowWidth;
    this.windowHeight = windowHeight;
    this.platform = platform;
    // <iPhone8,2 >
    if (model.indexOf('iPhone X') > -1) {
      model = 'ipx'
    }
    if ("CHM-TL00H".indexOf(model) > -1) {
      statusBarHeight = 0;
    }
    this.statusBarHeight = statusBarHeight;



    this.supperClass = model.replace(/\s+|<.+>/g, '') + ' ' + brand + ' ' + platform;
    // this.isIphoneX = model.indexOf('iPhone X') > -1;
    this.SDKVersion = parseFloat(SDKVersion);
    this.wxVersion = version;

    this.deviceInfo = sign.header(deviceInfoObj);
    this.info = '手机型号:' + model + ' 微信版本:' + version + ' 操作系统:' + system + ' SDK:' + SDKVersion;
    wx.getNetworkType({
      success: function (res) {
        deviceInfoObj.Net = res.networkType
        _this.deviceInfo = sign.header(deviceInfoObj);
      }
    })
  },
  rpx2px(rpx){
    return this.windowWidth / 750 * rpx;
  },
  px2rpx(px){
    return 750 / this.windowWidth * px;
  },
  toMiniProgram(appId, path) {
    wx.navigateToMiniProgram({
      appId: appId,
      path: path,
      success(res) {
        console.log('小程序打开成功')
      }
    });
  },

  getToday() {
    var date = new Date();
    return date.getMonth() + 1 + ',' + date.getDate();
  },
  showErrorModal(msg, title = '错误提示') {
    return wx.showModal({
      title: title,
      content: '错误原因：' + msg + ' 您可以截图并在< 我的->意见反馈 > 里反馈此问题，我们会尽快解决问题，给您带来的不便敬请谅解！' + this.info,
      showCancel: false
    });
  },
  msg: function (title, isImage, time) {
    var obj = {
      title: title,
      icon: 'success',
      duration: time || 1000
    }
    if (isImage) {
      obj.image = '/res/tip.png'
    }
    wx.showToast(obj);
  },
  show(content, title ="提示"){
    wx.showModal({
      title,
      content,
      showCancel: false
    })  
  },
  toINOTCH(path,data){
    path = path || 'pages/index/index';
    var search = [];
    for(var key in data){
      search.push(`${key}=${data[key]}`)
    }
    if (search.length > 0){
      path += '?' + search.join('&');
    }
    wx.navigateToMiniProgram({
      appId: 'wxf9154a17aa287e15',
      path: path,
      envVersion: this.base.indexOf('test') > -1 ? 'trial' :'release',
    })
  },

  formatDate(date) {
    if(typeof date === 'string'){
      date = new Date(parseInt(date.slice(6)));
    } 
    const month = date.getMonth() + 1;
    const day = this.checkTime(date.getDate());
    const hour = this.checkTime(date.getHours());
    const minute = this.checkTime(date.getMinutes());
    return `${month}月${day}日 ${hour}:${minute}`
  },

  checkTime(value) {
    return value < 10 ? "0" + value : value
  },
  getDistance(time) {
    // time = '/Date(1506649390000)/'
    time = parseInt(time.slice(6));
    var disMinutes = (Date.now() - time) / 1000 / 60;
    if (disMinutes < 1) return '刚刚';
    if (disMinutes < 60) return parseInt(disMinutes) + '分钟前';
    if (disMinutes < 60 * 24) return parseInt(disMinutes / 60) + '小时前';
    // parseInt(disMinutes / 60 / 24)+'天前'
    if (disMinutes < 60 * 24 * 2) return '昨日';
    if (disMinutes < 60 * 24 * 3) return '前天';
    time = new Date(time);
    return `${time.getFullYear()}年${time.getMonth()+1}月${time.getDate()}日`

    // return '最近'
    // if (disMinutes < 60 * 24 * 30) return parseInt(disMinutes / 60 / 24) + '天前';
    // if (disMinutes < 60 * 24 * 30 * 12) return parseInt(disMinutes / 60 / 24 / 30) + '月前';
    // return parseInt(disMinutes / 60 / 24 / 30 / 12) + '年前';
  },

  getRect: function (selector) {
    return new Promise((resolve, reject)=>{
      wx.createSelectorQuery().select(selector).boundingClientRect(resolve).exec()
    })
  },
  getRectsLoop(selector){
    return new Promise((resolve, reject)=>{
      var count = 0;
      function loop() {
        wx.createSelectorQuery().selectAll(selector).boundingClientRect((res)=>{
          if(res.length > 0){
            resolve(res);
          }else{
            if(count < 4){
              count++;
              setTimeout(loop, 100)
            }else{
              reject();
            }
          }
        }).exec()
      }
      setTimeout(loop, 100)
    })
  },

}
util.init();


exports.util = util;