var { getStorageSync, setStorage } = require('fn');
/**
 * 按天限制次数类
 * @param  {string} name 给此限制命名
 * @param  {string} count 限制次数
 * @return {object}    创建的类
 */
class DayLimit{
  static today = (() => {
    var date = new Date();
    return date.getMonth() + 1 + ',' + date.getDate();
  })()
  constructor(name, count=3){
    if(!name) throw '请给此限制命名';
    this.name = name;
    this.info = getStorageSync('limit-' + name) || {};
    if (DayLimit.today !== this.info.date) {
      this.info = {
        date: DayLimit.today,
        currentCount: 0,
        keys: ',',
        limitCount: count,
        vip:!Number(count)
      }
      this._saveInfo();
    }
  }
  get isExceed() {//是否超出
    if (this.info.vip) return false;
    return this.info.limitCount <= this.info.currentCount
  }
  set vip(value){
    this.info.vip = value;
    this._saveInfo();
  }
  set LimitCount(value) {
    if (this.info.limitCount == value) return;
    this.info.limitCount = value;
    this._saveInfo();
  }
  get LimitCount(){
    return this.info.limitCount
  }
  get remain(){
    return this.info.limitCount - this.info.currentCount
  }
  get currentCount(){
    return this.info.currentCount
  }
  set currentCount(count){//直接加次数
    this.info.currentCount = count;
    this._saveInfo();
  }
  _saveInfo() {
    setStorage({
      key: 'limit-' + this.name,
      data: this.info
    })
  }
  has(key){
    return this.info.keys.indexOf(`,${key},`) > -1
  }
  isExceedByKey(key){
    return !this.has(key) && this.isExceed
  }
  countByKey(key) {//根据key加次数
    if (key) {
      if (this.has(key)) return;
      this.info.keys += `${key},`;
    }
    this.info.currentCount++;
    this._saveInfo();
  }
  destroy(){
    DayLimit[this.name] = null;
  }
}

export default function (name, count){
  var res = DayLimit[name];
  if (res){
    count = Number(count);
    if (count && res.LimitCount != count) res.LimitCount = count;
    return res;
  }
  return DayLimit[name] = new DayLimit(name, count);
}
