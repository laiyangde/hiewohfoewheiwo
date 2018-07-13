var { util } = require('util');
class Message {
  constructor() {
    this.old = util.getStorageSync('messageCounts') || { PraiseCount: 0, CommentCount: 0, AttentionUserCount: 0, UserAttentionCount:0 }
  }
  update(userID){
    return this.promise || (this.promise = util.request({ url: 'list/InformationCenter', data: { userID} }).then((res) => {
      return this.new = res.Data;
    }))
  }
  get Dvalue(){
    var obj = {};
    if(this.new){
      let total = 0;
      for (var key in this.new) {
        if (key === 'UserAttentionCount') continue;
        obj[key] = this.new[key] - this.old[key];
        total += obj[key];
      }
      obj.needBrowerCount = total;
      return obj;
    }
    return { PraiseCount: 0, CommentCount: 0, AttentionUserCount: 0 };
  }
  set browsedName(name){
    if(this.new){
      this.old[name] = this.new[name];
      util.setStorage({
        key: 'messageCounts',
        data: this.old
      });
    }
  }
}
export default function (name = "message") {
  return Message[name] || (Message[name] = new Message());
}
