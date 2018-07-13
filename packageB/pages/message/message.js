'use strict'
var { Common } = require('../../../utils/common');
var { util } = require('../../../utils/util');
import _message from '../../../utils/message';
var app = getApp();

var Message = new Common();
Message.expend({
  data: {
    miniProgramTitle: '',
    avatarUrl: '',
    nickName: '',
    btns: [
      {
        icon: 'icon-thumb-up-me.svg',
        title: '赞我的',
        key:"PraiseCount"
      },
      {
        icon: 'icon-comment-me.svg',
        title: '评论我的',
        key: "CommentCount"
      },
      {
        icon: 'icon-attention-me.svg',
        title: '关注我的',
        key: "AttentionUserCount"
      }
    ]
  },
  onLoad(options) {
    this.__setTitle('消息中心');
    var Dvalue = _message().Dvalue;
    if (Dvalue.needBrowerCount){
      this.setData({
        btns: this.data.btns.map((item, index) => {
          item.isShowRedPoint = Dvalue[item.key] > 0
          return item
        })
      })
    }
  },
  onShareAppMessage() {
    return util.share();
  },

  /*=============================================================================================================*/
  toPage(e) {
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../pureListPage/pureListPage?pageindex=' + index
    })
    if (this.data.btns[index].isShowRedPoint) {
      this.setData({
        [`btns[${index}].isShowRedPoint`]: 0
      });
      _message().browsedName = this.data.btns[index].key;
      // this.changeCount(index)
    }
  },
  changeCount(index) {
    var sub;
    switch (index * 1) {
      case 0: sub = 'PraiseCount'; break;
      case 1: sub = 'CommentCount'; break;
      case 2: sub = 'AttentionUserCount'; break;
    }
    util.messagePromise.then((data) => {
      util.messageCounts[sub] = data[sub];
      util.setStorage({
        key: 'messageCounts',
        data: util.messageCounts
      });
    })
  }
});

Page(Message);
