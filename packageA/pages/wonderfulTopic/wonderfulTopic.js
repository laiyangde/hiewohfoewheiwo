'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { MultiList } = require('../../../utils/multiList');
var wonderfulTopic = new Basic();
wonderfulTopic.expend(MultiList);
wonderfulTopic.__init({
  interfaceName: 'ListPiazza/ActivityList',
  dataName: 'baseDatas',
  count: 2,
  needPageSize: 10,
  title:'精彩话题',
  data: {
    navArr: [
      { CategoryTitle: '话题' },
      { CategoryTitle: '活动' },
    ],
    template: 'activity-topic-list',
  },
  isNeedUserID: !0,
  onLoadBefore: function ({currentindex = 0}) {
    var currentIndex = +currentindex;
    var obj = {};
    if (currentIndex>0){
      obj.currentIndex = currentIndex;
    }
    this.setData(obj);
  },
  toTopicDetail(e) {
    wx.navigateTo({
      url: '/packageA/pages/topicDetail/topicDetail?topicID=' + e.currentTarget.dataset.topicid
    })
  },
  __dealWithData(data, obj) {
    var data = data.DataList.map((item) => {
      return item = this.getActivityStatus(item)
    });
    obj.dataList = this.dataList.concat(data || []);
    this.__reSetData(obj);
  },
  __supplementParam(obj) {
    obj.userID = app.userInfo.userID;
    if (this.index === 0) {
      obj.topicType = 1;
    }
  },
  getActivityStatus(data) {
    var now = Date.now();
    var disS = (parseInt(data.StartDate.slice(6)) - now);
    var disE = (parseInt(data.EndDate.slice(6)) - now);
    if (disE > 0) {
      data.activityState1 = disS > 0 ? '距离开始还剩' : '距离结束还剩';
      data.activityState2 = Math.ceil((disS > 0 ? disS : disE) / 1000 / 60 / 60 / 24);
    } else {
      data.activityState1 = parseInt(data.CheckEndDate.slice(6)) - now > 0 ? '奖品核对中 ' : '已结束'
    }
    return data;
  },
});

Page(wonderfulTopic);