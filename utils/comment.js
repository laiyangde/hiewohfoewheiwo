var app = getApp();
var { util } = require('util');

function getCommentParam(commentType) {
  switch (commentType) {
    case '专辑评论':
      commentType = 0; break;
    case '话题评论':
      commentType = 1; break;
  }
  return {
    '0': {//官方手记评论
      idKey: 'albumID',            //评论什么的id？
      listUrl: 'list/CommentList', //评论列表接口
      commentUrl: 'list/Comment',  //评论接口
      praiseUrl: 'list/CommentPraise', //评论点赞接口
      // prefix: 'CommentIDs',//点赞缓存前缀
      commentType         //评论类型
    },
    '1': { //话题评论
      idKey: 'partID',
      listUrl: 'list/topiccommentlist',
      commentUrl: 'list/addtopicpartcomment',
      praiseUrl: 'list/topiccommentpraise',
      // prefix: 'topicCommentIDs',
      commentType
    }
  }[commentType]
}
module.exports.Comment = {
  data: {
    totalCount: 0,//评论总数
    isShowTextArea: !1,
    isShowInput: !0,
    textAreaFocus: !1,
    isTextAreaEmpty: !0,
    // isLogin: !1,
    commentArrs: [],
    isMoreComment: !0,
    textareaVal: '',
    commentPlaceholder:'说说你的想法吧'
  },
  commentInit(name, showCount = 5) {
    this.showCount = showCount;
    Object.assign(this, getCommentParam(name));
  },
  onLoadBefore(options) {


    this[this.idKey] = this.commentTargetId = options[this.idKey];
    if (options.albumId){
      this[this.idKey] = this.commentTargetId = options.albumId
    }
    if (options.scene){
      this[this.idKey] = this.commentTargetId = options.scene
    }

    if (options.totalCount) {
      this.setData({ totalCount: options.totalCount })
    }
    // this.CommentIDs = util.getStorageSync(this.prefix + this.commentTargetId);
    util.commentListChange = {};
  },
  onShow() {
    if (util.commentListChange && util.commentListChange.modify) {
      delete util.commentListChange.modify;
      this.__reSetData(util.commentListChange);
      util.commentListChange = {};
    }
  },
  __addShare(obj) {
    obj.path = `${this.route}?${this.idKey}=${this.commentTargetId}`;
    // obj.path = this.route + '?albumId=' + this.albumID
  },
  __getComment() {//获取评论列表 默认5个
    var data = {
      pageIndex: 0,
      pageSize: this.showCount,
      [this.idKey]: this.commentTargetId,
      userID: app.userInfo.userID
    }
    util.request({ url: this.listUrl, data })
      .then((res) => {
        var obj = {};
        var { RecordCount, DataList, HasNext } = res.Data;
        if (app.isLogin()) {
          obj.isLogin = !0;
        }
        // if (DataList) obj.commentArrs = this.__parseComment(DataList);
        if (DataList) obj.commentArrs = DataList;
        obj.isMoreComment = HasNext;
        this.noUpdateComment = !1;
        obj.totalCount = RecordCount;
        this.setData(obj);
      })
  },
  __getReleaseType(){
    return this.releaseType
  },
  __publishComment(content) {
    var now = Date.now();
    if ((now - util.preCommentTime)/1000 < (util.setting.preCommentTime || 10000)){
      return util.msg('您的输入频繁，请稍后再来！');
    }
    if (this.isLoading) return;
    this.isLoading = !0;
    wx.showLoading({ title: '评论中...' });
    var param = { url: this.commentUrl, data: { [this.idKey]: this.commentTargetId, userID: app.userInfo.userID, content } }
    
    if (this.idKey === 'partID'){
      param.data.releaseType = this.__getReleaseType();
    }
    util.request(param)
      .then((res) => {
        util.msg('评论成功！');
        util.preCommentTime = now;
        var obj = {
          isShowTextArea: !1,
          totalCount: +this.data.totalCount + 1,
          textareaVal: ''
        };
        if (!this.noUpdateComment) {
          this.__commentUpdate({
            CommentID: isNaN(res.Data) ? res.Data.CommentID : res.Data,
            Content: content,
            LikeCount: 0,
            IsPraise:0,
            CommentDate: util.formatDate(new Date()),
            UserObject: app.userInfo
          }, obj)
        }
        this.__reSetData(obj);
        setTimeout(()=>{
          this.isLoading = !1
        },500)
      }).catch((e) => {
        this.isLoading = !1
        if (e && e.errMsg) {
          return util.msg(e.errMsg, 1);
        }
        util.msg('评论失败！', 1);
      })
  },
  __commentUpdate(currentItem, obj) {
    var commentArrs = this.data.commentArrs
    commentArrs.unshift(currentItem);
    obj.commentArrs = commentArrs.slice(0, 5);
  },
  thumbUp(e) {//评论点赞
    if (this.isLoading) return;
    this.isLoading = !0
    var index = e.currentTarget.dataset.index;
    var { commentid: CommentID, likecount: LikeCount, ispraise: IsPraise, listname: listName } = e.currentTarget.dataset;
    if (IsPraise) {
      this.isLoading = !1
      return;
    };
    // var storageKey = this.prefix + this.commentTargetId;
    util.request({ url: this.praiseUrl, data: { commentID: CommentID, userID: app.userInfo.userID } }).then((res) => {
      util.msg('点赞成功！');
      this.__reSetData({
        [`${listName}[${index}].IsPraise`]: 1,
        [`${listName}[${index}].LikeCount`]: ++LikeCount
      });
      this.isLoading = !1
    }).catch((e) => {
      if (e.errMsg === '已点赞,请勿重复点赞！') {
        this.__reSetData({
          [`${listName}[${index}].IsPraise`]: 1,
        });
      }
      this.isLoading = !1
      if (e.origin === 'server') {
        
        return util.msg(e.errMsg, 1);
      }
      util.msg('点赞失败！', 1);
    })
  },
  moreComment() {
    var url = `/pages/commentList/commentList?commentType=${this.commentType}&totalCount=${this.data.totalCount}&commentTargetId=${this.commentTargetId}`
    if (this.idKey === 'partID') {
      url += '&releaseType='+this.__getReleaseType();
    }
    wx.navigateTo({
      url
    })
  },
  cancle() {
    this.setData({
      isShowTextArea: !1,
      textareaVal: '',
      textAreaFocus: !1
    })
  },
  publish(e) {
    if (this.value.trim()===""){
      return util.msg(this.data.commentPlaceholder === "说说你的想法吧" ? '评论不能为空' : '回复不能为空')
    }
    return this.data.commentPlaceholder === "说说你的想法吧" ? this.__publishComment(this.value) : this.commentReply(this.value);
  },
  commentHandle(e) {
    var { commentid, nickname, userid,content} = e.currentTarget.dataset;
    console.log(e)
    var obj = {
      isShowTextArea: !0,
      textAreaFocus: !0,
    }
    if (commentid){
      obj.commentPlaceholder = '@' + nickname;
      this.ReplyComment = {
        commentID: commentid, ReplyNickName: nickname, userID: userid, ReplyContent:content
      }
    }else{
      obj.commentPlaceholder = "说说你的想法吧"
    }
    if (this.data.isLogin !== app.isLogin()){
      obj.isLogin = app.isLogin();
    }
    this.setData(obj);
  },
  textareaIphut(e) {
    var value = e.detail.value.trim();
    var isTextAreaEmpty = value === '';
    if (this.data.isTextAreaEmpty !== isTextAreaEmpty) {
      this.setData({
        isTextAreaEmpty: isTextAreaEmpty
      })
    }
    this.value = value;
  },
  commentReply(value){ //评论回复
    if (this.isLoading) return;
    this.isLoading = !0;
    util.request({ url: 'List/ReplyComments', data: { 
      commentID: this.ReplyComment.commentID, 
      userID: app.userInfo.userID, 
      content: value}
    }).then(res=>{
      util.msg('回复成功！');
      var obj = {
        isShowTextArea: !1,
        totalCount: +this.data.totalCount + 1,
        textareaVal: ''
      };
      var itemObj = {
        CommentID: isNaN(res.Data) ? res.Data.CommentID : res.Data,
        Content: value,
        LikeCount: 0,
        IsPraise: 0,
        CommentDate: util.formatDate(new Date()),
        UserObject: app.userInfo
      }
      if (this.data.commentPlaceholder !== "说说你的想法吧") {
        itemObj.ReplyComment = this.ReplyComment;
      }
      this.__commentUpdate(itemObj, obj);
      this.__reSetData(obj);
      this.isLoading = !1
    }).catch(e=>{
      this.isLoading = !1
      if (e && e.errMsg) {
        return util.msg(e.errMsg, 1);
      }
      util.msg('评论失败！', 1);
    })
  }
}