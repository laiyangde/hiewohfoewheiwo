var Color = require('color');

/*
同wx.setStorage，增加失败时三次机会在次保存
*/
function setStorage(obj) {
  var count = 0;
  function loop() {
    if (!obj.fail) {
      obj.fail = msg => {
        console.log(msg,89898)
        if (++count < 3) {
          loop();
        }
      }
    }
    wx.setStorage(obj);
  }
  loop();
}
/*
同wx.getStorage，增加失败时三次机会在次获取
*/
function getStorage(obj) {
  var count = 0;
  function loop() {
    if (!obj.fail) {
      obj.fail = msg => {
        if (++count < 3) {
          loop();
        }
      }
    }
    wx.getStorage(obj);
  }
  loop();
}
/*
同wx.setStorageSync，增加失败时三次机会在次保存
*/
function setStorageSync(key, value) {
  var count = 0;
  while (count < 3){
    try {
      wx.setStorageSync(key, value);
      return !0;
    } catch (e) {
      count++;
    }
  }
  return !1;
}
/*
同wx.getStorageSync，增加失败时三次机会在次获取
*/
function getStorageSync(key) {
  var count = 0;
  while (count < 3) {
    try {
      return  wx.getStorageSync(key);
    } catch (e) {
      count++;
    }
  }
  return !1;
}


/**
*深度拷贝source对象到target对象
*@param target 目标对象
*@param source 源对象
*@return 返回添加的节点
**/
function deepAssign(target, source) {
  var _toString = Object.prototype.toString;
  for (var key in source) {
    if (_toString.call(source[key]) === "[object Object]") {
      target[key] = this.__deepAssign(target[key] || {}, source[key])
    } else {
      target[key] = source[key];
    }
  }
  return target;
}
/**
*判断对象是否为空对象
*@param [object]obj 目标对象
*@return [boolean] 是否为空对象
**/
function isEmpty(obj){
  for (var key in obj) {
    return !1
  }
  return !0
}
/*
*创建并返回一个像节流阀一样的函数，当重复调用函数的时候，至少每隔 wait毫秒调用一次该函数。
*对于想控制一些触发频率较高的事件有帮助。
*默认情况下，throttle将在你调用的第一时间尽快执行这个function，并且，
*如果你在wait周期内调用任意次数的函数，都将尽快的被覆盖。
*如果你想禁用*第一次首先执行的话，传递{leading: false}，
*还有如果你想禁用最后一次执行的话，传递{trailing: false}
* 例子：
  var throttled = throttle(updatePosition, 100,{leading: true,trailing:true});
  $(window).scroll(throttled);
*/

function throttle(func, wait, options){
  var context, args, result;
  var timeout = null;
  var previous = 0;
  if (!options) options = {};
  var later = function () {
    previous = options.leading === false ? 0 : Date.now();
    timeout = null;
    result = func.apply(context, args);
    if (!timeout) context = args = null;
  };
  return function () {
    var now = Date.now();
    if (!previous && options.leading === false) previous = now;
    var remaining = wait - (now - previous);
    context = this;
    args = arguments;
    if (remaining <= 0 || remaining > wait) {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
      }
      previous = now;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    } else if (!timeout && options.trailing !== false) {
      timeout = setTimeout(later, remaining);
    }
    return result;
  };
}

function downloadImage(url) {//图片下载获得临时地址promise
  if (!url) return Promise.resolve(null);
  // if (url.indexOf('//tmp') > -1 || url.indexOf('../res') > -1) return Promise.resolve({ tempFilePath: url });
  return new Promise((resolve, reject) => {
    wx.getImageInfo({
      src: url.replace(/https?/, 'https'),
      success: resolve,
      fail: reject
    })
    // wx.downloadFile({
    //   url: url.replace(/https?/, 'https'),
    //   success: resolve,
    //   fail: reject
    // })
  })
}
function random(min,max){
  return Math.floor((max - min + 1) * Math.random()) + min
}


function randomColor() { //随机生成十六进制颜色
  return Color({ hue: random(0, 360), saturation: random(40, 80) / 100, lightness: random(50, 70)/100 }).toCSS()
}


module.exports =  {
  setStorage,
  getStorage,
  throttle,
  setStorageSync,
  getStorageSync,
  deepAssign,
  isEmpty,
  throttle,
  downloadImage,
  randomColor,
  random
}