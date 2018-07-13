module.exports.SelectNav = {
    data:{
      suspensionInfo:{
        isSelectedNav: false,
        selectedNavItems: [
          '按最新排序',
          '按热度排序',
          '我发布的'
        ],
        currentNavIndex: 0
      }
    },
    toggleSelected(){
      this.setData({
        ['suspensionInfo.isSelectedNav']: !this.data.suspensionInfo.isSelectedNav
      })
    },
    navItemSelected(e){
      var currentNavIndex = e.currentTarget.dataset.index;
      var obj = {
        ['suspensionInfo.isSelectedNav']: false
      }
      if (currentNavIndex != this.subNavIndex){
        obj['suspensionInfo.currentNavIndex'] = currentNavIndex;
        obj.scollTop = this.getThreshold ? this.threshold : 0;
      }
      // this.index = currentNavIndex * 1;
      // this.__getRelative();
      this.__reSetData(obj);
      this.subNavIndex = currentNavIndex;
      if (obj['suspensionInfo.currentNavIndex']!==undefined){
        this.__emit('navItemSelectedAfter', currentNavIndex)
      }
      // if (this.dataList.length === 0) {
      //   this.__getData()
      // }
    },
    navItemSelectedAfter(currentNavIndex) {
      this.sectionPoistion = [];
      this.dataList = [];
      this.pageIndex = 0;
      this.filterStr = '';
      this.__loadedMore()
    }
}