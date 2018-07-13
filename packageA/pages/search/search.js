'use strict';
var app = getApp();
var { Basic } = require('../../../utils/basic');
var { util } = require('../../../utils/util');
var { SelectNav } = require('../../../utils/selectNav');
var Search = new Basic();
Search.expend(SelectNav);
Search.__init({
  title: '搜索',
  everyCount:120,
  interfaceName: 'list/SearchList',
  data:{
    navArr: [
      { CategoryTitle: '壁纸' },
      { CategoryTitle: '表情' },
      { CategoryTitle: '头像' },
    ],
    suspensionInfo:{
      selectedNavItems: ['按最新排序', '按热度排序','按总榜排序']
    },
    currentIndex: 0,
    isHideResult: !0,
    placeholder: '壁纸',
    isFocus: !1,
    isCloseShow: !1,
    searchKey: '',
    keyWords: [
      {
        recent: [],
        hot: []
      }, 
      {
        recent: [],
        hot: []
      }, 
      {
        recent: [],
        hot: []
      }
    ],
    adData: []
  },
  back(){
    if (this.data.isHideResult){
      wx.navigateBack({
        delta: 1,
      });
    }else{
      this.resetHandle()
    }
  },
  onLoad(options) {
    this.isShareEntry = options.keyword !== undefined;
    var { currentIndex = 0, keyword: searchKey = '' } = options
    this.__addProperties();
    this.__getRelative();
    this.__setTitle();
    var obj = {};
    if (getCurrentPages().length === 1) {
      obj['suspensionInfo.isShareEntry'] = !0
    }
    obj.currentIndex = currentIndex * 1;
    this.suffix = ['bz', 'bq', 'tx'][currentIndex];
    if (searchKey && this.isShareEntry) {
      var recent = util.getStorageSync('recentKeyWord-' + this.suffix) || []
      obj['keyWords[' + currentIndex + '].recent'] = recent;
      this.setData(obj);
      this.searchHandle(searchKey);
    } else {
      // obj.isFocus = !0;
      this.__getKeyWord(obj, currentIndex)
    }
    util.request({
      url: 'List/RandomCategory',
    }).then(res => {
      var data = res.Data[0];
      this.setData({
        emoteUrl: data.IconUrl,
        emoteName: data.SubName
      })
      this.EmoteID = data.SubID
    })
    util.ad.then(res => {
      var adData = res['10004'];
      this.setData({
        adData
      })
    })
  },
  toMiniEmote() {
    util.toMiniProgram('wxb66c141ee02a4eb4', 'pages/category/category?index=0&ID=' + this.EmoteID)
  },
  change: function (e) {
    var obj = {};
    var currentIndex = e.detail.current;
    obj.currentIndex = currentIndex;
    this.suffix = ['bz', 'bq', 'tx'][currentIndex];
    if (this.data.keyWords[currentIndex].hot.length === 0) {
      this.__getKeyWord(obj, currentIndex)
    } else {
      this.__reSetData(obj);
    }
  },
  navSwitch: function (e) {
    this.setData({
      currentIndex: e.currentTarget.dataset.index,
    })
  },

  inputHandle(e) {
    var value = e.detail.value.trim();
    if (value === '') {
      this.data.isCloseShow && this.setData({
        isCloseShow: !1
      })
    } else {
      !this.data.isCloseShow && this.setData({
        isCloseShow: !0
      })
    }
  },
  resetHandle() {
    var obj = {
      isCloseShow: !1,
      isHideResult: !0,
      isFocus: !0,
      searchKey: '',
      isHideBackTop: !0
    }
    // paddingTop: 0,//列表按模块处理  当到达n模块时   占用n-2模块的位置，
    //   beforeIndex: -every,//显示范围
    //     afterIndex: every * 2,
    //       every,//每48个为一个模块
    // subNavIndex: 0,
    //   sectionPoistion:[],//每个模块的位置
    //     sectionIndex:0,//当前在哪个模块
    if (this.dataList.length !== 0) {
      obj.dataList = [];
      obj.paddingTop = 0;
      obj.beforeIndex = -this.every;
      obj.afterIndex = this.every * 2;
      obj[`suspensionInfo.currentNavIndex`] = 0;
      this.pageIndex = 0;
      this.hasNext = !0;
      this.filterStr = '';
      this.sectionIndex = 0;
      this.subNavIndex = 0;
      this.sectionPoistion = [];
    }
    
    this.__reSetData(obj);

    if (this.data.keyWords[this.data.currentIndex].hot.length === 0) {
      this.__getKeyWord({}, this.data.currentIndex)
    }

  },
  keySearch(e) {
    var value = e.currentTarget.dataset.value;
    this.searchHandle(value);
    // this.setData({
    //   searchKey: value,
    //   isCloseShow: !0
    // })
  },
  searchHandle(e) {
    if (this.isLoading) {
      return;
    }
    var value = typeof e === 'string' ? e : e.detail.value.trim();

    if (value === this.data.searchKey) return;
    if (value === '') {
      util.msg('请输入关键词', 1);
      return this.setData({
        searchKey: ''
      });
    }

    //如果历史搜索关键字么有此关键字，则添加
    var currentIndex = this.data.currentIndex;
    var recentKey = this.data.keyWords[currentIndex].recent;
    var index = recentKey.indexOf(value);

    if (index === -1) {
      recentKey.unshift(value);
      if (recentKey.length > 10) {
        recentKey.pop();
      }
      util.setStorage({
        key: "recentKeyWord-" + this.suffix,
        data: recentKey
      });
    } else {
      recentKey.unshift(recentKey.splice(index, 1)[0]);
    }
    //关闭搜索关键字页，显示搜索结果页
    this.setData({
      isHideResult: !1,
      searchKey: value,
      ['keyWords[' + currentIndex + '].recent']: recentKey,
      isCloseShow: !0
    });

    if (this.dataList.length !== 0) {
      this.dataList = [];
      this.pageIndex = 0;
      this.hasNext = !0;
      this.filterStr = '';
    }
    this.__getData();

    wx.reportAnalytics('search', {
      keyword: value,
      searchtype: currentIndex,
    });
  },
  clearRecentKey() {
    var _this = this;
    var currentIndex = this.data.currentIndex
    wx.showModal({
      title: '提示',
      content: '确认要清空最近搜索？',
      confirmText: '清空',
      success: (res) => {
        if (res.confirm) {
          _this.setData({
            ['keyWords[' + currentIndex + '].recent']: []
          })
          util.setStorage({
            key: "recentKeyWord-" + this.suffix,
            data: ''
          });
        }
      }
    })
  },
  __dealWithData(data, obj) {
    obj.dataList = this.dataList.concat(this.__filterTheSame(data.DataList || data.EmojiList || []));
    if (obj.dataList.length < 16) {
      obj.LoadingText = obj.dataList.length === 0 ? '无搜索结果!' : '';
    }
    this.__reSetData(obj);
  },
  __supplementParam(obj) {
    obj.word = this.data.searchKey;
    obj.sort = this.data.suspensionInfo.currentNavIndex + 1;
    if (this.data.currentIndex === 0){
      this.interfaceName = 'list/SearchList';
    }else{
      this.interfaceName = 'list/EmojiSearchList';
      obj['type'] = this.data.currentIndex;
    }
  },
  __addShare(obj) {
    obj.path = this.route + '?currentIndex=' + this.data.currentIndex + '&keyword=' + this.data.searchKey
  },
  __getKeyWord(obj, currentIndex) {
    var recent = util.getStorageSync('recentKeyWord-' + this.suffix) || [];
    var param = { url: currentIndex === 0 ? 'list/SearchWord' : 'list/EmojiSearchWord' }
    if (currentIndex != 0) {
      param.data = {
        'type': currentIndex
      }
    }
    util.request(param)
      .then((res) => {
        obj['keyWords[' + currentIndex + ']'] = { recent, hot: res.Data || [] }
        this.__reSetData(obj);
      })
      .catch(() => {
        this.__reSetData(obj);
      })
  }
})

Page(Search);