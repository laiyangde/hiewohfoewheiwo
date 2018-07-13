// pages/replyTopic/replyTopic.js
var { util } = require('../../../utils/util');
var { Common } = require('../../../utils/common');
var app = getApp();

var Reply = new Common();
Reply.expend({
  data: {
    uploadImages: [],
    textareaValue: ''
  },
  onLoad: function (options) {
    this.topicID = options.topicid || options.topicID;
    this.value = '';
    this.setData({
      isLogin: app.isLogin(),
      ['suspensionInfo.title']:'发布内容'
    })
  },
  addImage() {
    var _this = this;
    var len = 9 - this.data.uploadImages.length;
    if (!len) return;
    wx.chooseImage({
      count: len, // 默认9
      success: function (res) {
        // 返回选定照片的本地文件路径列表，tempFilePath可以作为img标签的src属性显示图片
        var tempFilePaths = res.tempFilePaths
        _this.setData({
          uploadImages: _this.data.uploadImages.concat(res.tempFilePaths)
        })
      }
    })
  },
  inputHandle(e) {
    this.value = e.detail.value.trim();
  },
  preview(e) {
    var index = e.currentTarget.dataset.index;
    wx.previewImage({
      current: this.data.uploadImages[index], // 当前显示图片的http链接
      urls: this.data.uploadImages // 需要预览的图片http链接列表
    })
  },
  deleteImage(e) {
    var index = e.currentTarget.dataset.index;
    var uploadImages = this.data.uploadImages;
    uploadImages.splice(index, 1);
    this.setData({
      uploadImages: uploadImages
    })
  },
  publish() {
    // if (this.value.length < 5) {
    //   this.setData({ textareaValue: this.value })
    //   return util.msg('话题文字最少5个！', 1)
    // }
    if (!app.userInfo.userID){
      app.loginPromise.then(res=>{
        this.publish();
      })
    }

    if(this.isLoading) return;
    var len = this.data.uploadImages.length;
    if (!len && !this.value) {
      return util.msg('请输入文字或上传图片！', 1)
    }
    this.isLoading = !0;
    wx.showLoading({ title: '发布中,请稍候...', mask: !0 });
    var param = { url: 'list/addtopicpart', data: { userID: app.userInfo.userID } };
    if (this.topicID) {//话题发布
      param.url = 'list/addtopicpart';
      param.data.topicID = this.topicID;
      param.data.title = this.value;
    } else {//广场发布
      param.url = 'ListPiazza/AddPiazzaRelease';
      param.data.content = this.value;
    }
    return util.request(param)
      .then((res) => {
        if (!len) {
          return this.publishComplete(res);
        }
        this.count = 0;
        wx.showLoading({ title: '开始上传图片..', mask: !0 });
        this.uploadImage(res.Data);
      }).catch((e) => {
        wx.hideLoading();
        this.isLoading = !1;
        if (e && e.errMsg === '文本违规') {
          return util.msg('文本违规,发布失败！');
        }
        util.msg('发布失败!', 1)
        // util.showErrorModal(e.toString() === '[object Object]' ? e.errMsg : e);
      })

  },
  uploadImage(partID) {
    var filePath = this.data.uploadImages[this.count++],
      isLast = this.data.uploadImages.length === this.count ? 1 : 0;
    var param = { url: 'list/uploadtopicpartpic', filePath, data: { total: this.data.uploadImages.length, sortIndex: this.count, isLast, partID, releaseType: this.topicID ? 0 : 1 /*0话题 1广场*/ }, name: 'uploadImage' };

    return util.request(param)
      .then((res) => {
        wx.showLoading({ title: '已上传第' + this.count + '张', mask: !0 })
        // console.log('上传完成第' + this.count + '张');
        if (isLast) {
          return this.publishComplete(res);
        }
        return this.uploadImage(partID)
      }).catch((e) => {
        wx.showModal({
          title: '发布失败',
          content: e.toString() === '[object Object]' ? e.errMsg : e,
          showCancel: false
        });
        wx.hideLoading();
        this.isLoading = !1;
      })
  },
  publishComplete(res) {
    util.msg('发布成功！');
    setTimeout(() => {
      util.topicReplyChange.currentNavIndex = 0;
      util.topicReplyChange.modify = !0;
      wx.navigateBack();
      this.isLoading = !1;
    }, 500)
  },
  onReady(){},

})

Page(Reply)