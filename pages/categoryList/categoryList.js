'use strict';
var app = getApp();
var { util } = require('../../utils/util');
var { Basic } = require('../../utils/basic');
var { MultiList } = require('../../utils/multiList');
var { SelectNav } = require('../../utils/selectNav');
var categoryList = new Basic();
categoryList.expend(MultiList, SelectNav);
categoryList.__init({
  interfaceName: 'list/CategoryContent',
  dataName: 'baseDatas',
  isScrollNav:!0,
  data: {
    template: 'base-wallpaper-list',
    suspensionInfo:{
      selectedNavItems: [
        '按最新排序',
        '按热度排序',
        '按总榜排序',
      ]
    }
  },
  __supplementParam(obj) {
    obj.categoryId = this.categoryId;
    obj.label = this.label;
    obj.sort = this.subNavIndex+1;
    obj.needCateList = 2
  },
  __addShare(obj) {
    obj.path = this.route + '?categoryId=' + this.categoryId + '&label=' + this.label + '&title=' + this.title
  },
  onLoad({ categoryId = 3, label = '推荐', title = '风景建筑' }) {
    this.categoryId = categoryId;
    this.label = label;
    this.title = title;
    //获取导航
    util.request({
      url:'list/CategoryContent',
      data:{
        categoryId: this.categoryId,
        pageSize:0
      }
    }).then(res=>{
      var navArr = res.Data.SubArray.map(item=>{
        var { CategoryID, SubName: CategoryName, IconUrl: CategoryIcon} = item;
          return {CategoryID, CategoryName, CategoryIcon}
      }), len = navArr.length, i = 0,obj={};
      for (; i < len; i++) {
        if (navArr[i].CategoryName === this.label) {
          this.index = i;
          break;
        }
      }
      return this.initNav(navArr);
    }).then(res=>{
      this.onLoaded();
    }).catch(e=>{
      console.log(e)
    })
  },
  changeBefore(currentIndex, obj) {
    this.label = this.data.navArr[currentIndex].CategoryName;
    obj['suspensionInfo.currentNavIndex'] = this.subNavIndex;
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || []));
    if (obj.dataList.length < 9) {
      obj.LoadingText = obj.dataList.length === 0 ? '暂没有壁纸！' : '';
    }
    this.__reSetData(obj);
  }

})
Page(categoryList);