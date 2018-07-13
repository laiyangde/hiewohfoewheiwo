'use strict';
var app = getApp();
var { util } = require('../../../utils/util');
var { Basic } = require('../../../utils/basic');
var { MultiList } = require('../../../utils/multiList');
var { SelectNav } = require('../../../utils/selectNav');
var AvatarEmote = new Basic();
AvatarEmote.expend(MultiList,SelectNav);

// 头像列表 avatarlist? pageindex = 0 & pagesize=30 & sort=1   1最热2最新
//表情列表 expressionlist?pageindex=0&pagesize=30&sort=1  1最热2最新
// 头像或表情分类列表 categorylist?cateID=1   1头像2表情
AvatarEmote.__init({
  interfaceName: 'List/CategoryMoreList',
  dataName: 'baseDatas',
  everyCount:66,
  data: {
    suspensionInfo:{
      selectedNavItems: ['按最新排序', '按热度排序','按总榜排序']
    },
    template: 'avatar-emote-list',
  },
  toAvatarEmoteList(e) {
    var index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: '../avatarEmoteList/avatarEmoteList?sort=0&cateID=' + this.cateID + '&subCateID=' + this.dataList[index].CateModel.ID
    })

  },
  customOnLoad({ cateid, categroyid = 0, cateID = 1}) {
    cateid = +(cateid || cateID);
    this.cateID = cateid;
    this.CategroyID = +categroyid;
    this.title = cateid === 1 ? '头像' : '表情';
    this.suffix = cateid === 1 ? 'tx' : 'bq';
    //获取导航
    util.request({
      url: 'List/CategoryNavigationList',
      data: {
        cateID: cateid,
      }
    }).then(res => {
      console.log(res)
      var navArr = res.Data.map(item=>{
        var { ID: CategroyID, Icon: CategoryIcon, Title: CategoryName} = item;
        return { CategroyID, CategoryIcon, CategoryName}
      }), len = navArr.length, i = 0, obj = {};
      for (; i < len; i++) {
        if (navArr[i].CategroyID === this.CategroyID) {
          this.index = i;
          break;
        }
      }
      return this.initNav(navArr, {title:this.title});
    }).then(res => {
      this.onLoaded();
    }).catch(e => {
      console.log(e)
    })
  },
  toSearch() {
    wx.navigateTo({
      url: '../search/search?currentIndex=' + (this.title === '头像' ? 2 : 1)
    })
  },
  changeBefore(currentIndex, obj) {
    obj['suspensionInfo.currentNavIndex'] = this.subNavIndex;
  },
  __supplementParam(obj) {
    obj.cateID = this.cateID;
    obj.sort = this.subNavIndex + 1;
    obj.subCateID = this.data.navArr[this.index].CategroyID
  },
  __addShare(obj) {
    obj.path = this.route + '?cateid=' + this.cateID + '&categroyid=' + this.data.navArr[this.index].CategroyID
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || []));
    if (obj.dataList.length < (this.sort === 3 ? 6 : 16)) {
      obj.LoadingText = obj.dataList.length === 0 ? '暂没有' + this.title + '！' : '';
    }
    this.__reSetData(obj);
  },
  getFilterId(filterItem) {
    return this.sort === 3 ? (filterItem.CateModel ? filterItem.CateModel.ID : ''): filterItem.ID
  },
  __setInterface() {
    if (this.sort === 3) {
      this.interfaceName = 'list/categorylist'
    } else {
      this.interfaceName = this.cateID === 1 ? 'list/avatarlist' : 'list/expressionlist'
    }
  }

});

Page(AvatarEmote);