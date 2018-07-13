'use strict';
var app = getApp();
var { Basic } = require('basic');
var { util } = require('util');
import Draw from 'draw'
module.exports.Poster = {
  isChange:true,
  data: {
    isShowPoster:false,
    poster:''
  },
  closePoster() {
    this.setData({
      isShowPoster: false
    })
  },
  openPoster(e) {
    if (!this.isChange && this.data.poster) return this.setData({ isShowPoster: true});
    this.setData({ isShowPoster: true, poster: '' });
    switch (this.route){
      case 'packageA/pages/topicReplyDetail/topicReplyDetail':
        // let draw = this.draw || (this.drwa = new Draw('myCanvas', "rpx"))
       var qr = `${util.base}WeChat/WeChatQRCode?jumpUrl=${this.route}&pid=${util.appType + 1}&width=132&scene=${this.partID}_${this.topicID}_${this.releaseType}`;
        this.topicReplyDetailPoster(new Draw('myCanvas', "rpx"), qr, this.data.TopicPartResultInfo);
        this.isChange = false;
      break;
      case 'pages/preview/preview':
        this.previewPoster();
      break;
      case 'packageB/pages/userHome/userHome':
      case 'pages/piazza/piazza':
      case 'packageA/pages/topicDetail/topicDetail':
        var draw = this.draw || (this.drwa = new Draw('myCanvas', "rpx")),
            data = this.dataList[e.currentTarget.dataset.index],
          { PartID, TopicID = this.topicID, releaseType = 1 } = data,
          qr = `${util.base}WeChat/WeChatQRCode?jumpUrl=packageA/pages/topicReplyDetail/topicReplyDetail&pid=${util.appType + 1}&width=132&scene=${PartID}_${TopicID}_${releaseType}`;
        if (this.route == 'packageA/pages/topicDetail/topicDetail') data.TopicTitle = this.data.TopicResultInfo.TopicTitle
        this.topicReplyDetailPoster(draw, qr, data);
      break;
      case 'packageA/pages/albumDetail/albumDetail':
        this.albumDetailPoster();
        this.isChange = false;
      break;
    }
  },
  albumDetailPoster(){
    var imgs = this.dataList.slice(0, 6);
    if (imgs.length===0) return;
    var { ImgUrl:banner, Desc} = this.data.AlbumObj;
    var draw = this.draw || (this.drwa = new Draw('myCanvas', "rpx"));
    var ctx = draw.ctx;
    var qrcode = `${util.base}WeChat/WeChatQRCode?jumpUrl=${this.route}&pid=${util.appType + 1}&width=132&scene=${this.albumID}`;
    ctx.drawImage('../../../res/poster-bg1.png', 0, 0, draw.rpx2px(466), draw.rpx2px(773));
    draw.addCustom((ctx) => {
      ctx.drawImage('../../../res/phone.png', draw.rpx2px(83), draw.rpx2px(42), draw.rpx2px(300), draw.rpx2px(547));//画手机壳
      ctx.setFillStyle('#fff')
      ctx.fillRect(draw.rpx2px(98), draw.rpx2px(101), draw.rpx2px(270), draw.rpx2px(412))
      //画底部白色区域
      // ctx.beginPath();
      // ctx.moveTo(0, draw.rpx2px(538));
      // ctx.quadraticCurveTo(width / 2, draw.rpx2px(470), width, draw.rpx2px(538));
      // ctx.lineTo(width, height);
      // ctx.lineTo(0, height);
      // ctx.closePath();
      // ctx.setFillStyle('white');
      // ctx.fill();
    })
    draw.addImage({
      src: banner,
      dy: 101,
      dx: 100,
      dw: 267,
      dh: 125,
      // radiu: 20
    })
    draw.addText({
      text: Desc,
      size: 12,
      color: "#979797",
      x: 105,
      y: 240,
      width:256,
      lineClamp:1,
      vAlign:'center'
    })
    var x = 105,y=252;
    imgs.forEach((item,i)=>{
      draw.addImage({
        src: item.ThumbImage,
        dy: y + Math.floor(i/3) * 151,
        dx: x + (i % 3) * 87,
        dw: 83,
        dh: 147,
        // radiu: 20
      })
    })
    draw.addCustom((ctx) => {
      let width = draw.rpx2px(466), height = draw.rpx2px(773);
      //画底部白色区域
      ctx.beginPath();
      ctx.moveTo(0, draw.rpx2px(538));
      ctx.quadraticCurveTo(width / 2, draw.rpx2px(470), width, draw.rpx2px(538));
      ctx.lineTo(width, height);
      ctx.lineTo(0, height);
      ctx.closePath();
      ctx.setFillStyle('white');
      ctx.fill();
    })
    draw.addText({
      text: Desc,
      size: 20,
      color: "#949494",
      x: 42,
      y: 540,
      width: 386,
      lineClamp: 2,
      lineHeight:30
    })

    draw.addText({
      text: util.appType === 0 ? '壁纸精选' : (util.appType === 2 ? '高清壁纸' : '哎喔壁纸'),
      size: 28,
      weight: "bold",
      color: "#4C4C4C",
      x: 198,
      y: 640
    })
    draw.addText({
      text: '长按识别免费下载该壁纸',
      size: 20,
      color: "#1DB18C",
      x: 198,
      y: 680
    })
    draw.addImage({
      src: qrcode,
      defealtSrc: 'https://minibizhi.313515.com/BiZhiStatic/qr.png',
      dy: 606,
      dx: 46,
      dw: 132,
      dh: 132,
    })

    draw.drawToImage().then(img => {
      this.setData({
        poster: img
      })
    })
  },
  topicReplyDetailPoster(draw, qr, data){
    console.log(qr)
    var ctx = draw.ctx;
    var { PartTitle, NickName, AvatarUrl, TopicTitle, TopicPartPicResultInfoList } = data;
    var len = TopicPartPicResultInfoList.length,imgUrl;
    if(len){
      imgUrl = TopicPartPicResultInfoList[0].Thumb
    }
    ctx.drawImage('/res/poster-bg2.png', 0, 0, draw.rpx2px(466), draw.rpx2px(773));
    draw.addText({
      text: "社区话题专区",
      size: 37,
      weight: "bold",
      color: "#004D39",
      x: 56,
      y: 65
    })
    TopicTitle && draw.addLabel({
      label: '#' + TopicTitle + '#',
      size: 22,
      color: "#004D39",
      x: 56,
      y: 140,
      radiu: 20,
      padding: "10 20",
      bgColor: "#fff"
    })
    draw.addText({
      text: util.appType === 0 ? '壁纸精选' : (util.appType === 2 ? '高清壁纸' : '哎喔壁纸'),
      size: 28,
      weight: "bold",
      color: "#4C4C4C",
      x: 198,
      y: 640
    })
    draw.addText({
      text: '长按识别免费下载该壁纸',
      size: 20,
      color: "#1DB18C",
      x: 198,
      y: 680
    })

    var x1 = 40, y1 = 310, w1 = 310;//头像
    var x2 = 40, y2 = 380, w2 = 400;//文字

    if (imgUrl){
      draw.addImage({
        src: imgUrl,
        dy: 215,
        dx: 20,
        dw: 200,
        dh: 356,
        // radiu: 20
      })
      x1 = 240;
      w1 = 146;
      y1 = PartTitle ? 310 : 370;
      x2 = 240, y2 = 380; w2 = 210;
    }
    draw.addImage({
      src: AvatarUrl || 'https://minibizhi.313515.com/BiZhiStatic/default.png',
      defealtSrc:'https://minibizhi.313515.com/BiZhiStatic/default.png',
      dy: y1,
      dx: x1,
      dw: 48,
      dh: 48,
      radiu: 26
    })
    draw.addImage({
      src: qr,
      defealtSrc: 'https://minibizhi.313515.com/BiZhiStatic/qr.png',
      dy: 606,
      dx: 46,
      dw: 132,
      dh: 132,
    })
    // ctx.drawImage(qrcode.path, 46, 606, 132, 132)
    draw.addText({
      text: NickName || '游客',
      size: 20,
      color: "#1DB18C",
      x: x1+66,
      y: y1+24,
      vAlign:'center',
      width:w1
    })
    PartTitle && draw.addText({
      text: PartTitle,
      size: 23,
      lineHeight:33,
      lineClamp:3,
      color: "#949494",
      x: x2,
      y: y2,
      width:w2
    })
    var res;
    if(imgUrl){
      res = draw.draw(false).then(()=>{
        draw.addLabel({
          label: `共${len}张图`,
          size: 18,
          color: "#fff",
          x: 220,
          y: 570,
          // radiu: "15 0 20",
          padding: 10,
          bgColor: "rgba(0,0,0,0.5)",
          hAlign: "right",
          vAlign: "bottom"
        })
        return draw.drawToImage(true);
      })
    }else{
      res = draw.drawToImage()
    }
    res.then(img=>{
      this.setData({
        poster:img
      })
    })
    res = null;
  },
  previewPoster() {
    var draw = this.draw || (this.drwa = new Draw('myCanvas', "rpx"));
    var ctx = draw.ctx;
    var { Image, ThumbImage = Image, PicInfoID, Labels, ID, PriceType = 0 } = this.data.imgList[this.currentIndex];
    var qrcode = `${util.base}WeChat/WeChatQRCode?pid=${util.appType + 1}&width=132&scene=${PicInfoID || ID}_${PriceType && 1}_${this.suffix}`;

    ctx.drawImage(`../../res/poster-bg${this.suffix === 'bz' ? 1 : 2}.png`, 0, 0, draw.rpx2px(466), draw.rpx2px(773));
    if(this.suffix === 'bz'){
      let width = draw.rpx2px(466), height = draw.rpx2px(773);
      draw.addImage({
        src: ThumbImage,
        dy: 100,
        dx: 100,
        dw: 268,
        dh: 'auto',
      })
      
      draw.addCustom((ctx)=>{
        ctx.drawImage('../../res/phone.png', draw.rpx2px(83), draw.rpx2px(42), draw.rpx2px(300), draw.rpx2px(547));//画手机壳
        //画底部白色区域
        ctx.beginPath();
        ctx.moveTo(0, draw.rpx2px(538));
        ctx.quadraticCurveTo(width / 2, draw.rpx2px(470), width, draw.rpx2px(538));
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        ctx.setFillStyle('white');
        ctx.fill();

      })
      if (Labels){//画便签
        draw.addLabel({
          label: Labels.split(',').slice(0, 3),
          size: 22,
          color: "r",
          randomColor: util.randomColor,
          x: 233,
          y: 538,
          radiu:20,
          between:15,
          padding: "10 15",
          hAlign: "center",
          vAlign:"top"
        })
      }
    }else{
      draw.addText({
        text: this.suffix === 'tx' ? '头像专区' : '表情专区',
        size: 37,
        weight: "bold",
        color: "#004D39",
        x: 56,
        y: 65
      })
      let txt = Labels.split(',')[1] || Labels.split(',')[0]
      txt && draw.addLabel({
        label: txt,
        size: 22,
        color: "#004D39",
        x: 56,
        y: 140,
        radiu: 20,
        padding: "10 20",
        bgColor: "#fff"
      })
      draw.addImage({
        src: Image,
        dy: 205,
        dx: 233,
        dw: 364,
        dh: 364,
        radiu: 24,
        hAlign:"center"
      })
    }
    draw.addText({
      text: util.appType === 0 ? '壁纸精选' : (util.appType === 2 ? '高清壁纸' : '哎喔壁纸'),
      size: 28,
      weight: "bold",
      color: "#4C4C4C",
      x: 198,
      y: 640
    })
    draw.addText({
      text: '长按识别免费下载该' + (this.suffix === 'bz' ? '壁纸' : (this.suffix === 'tx' ? '头像' : '表情')),
      size: 20,
      color: "#1DB18C",
      x: 198,
      y: 680
    })
    draw.addImage({
      src: qrcode,
      defealtSrc: 'https://minibizhi.313515.com/BiZhiStatic/qr.png',
      dy: 606,
      dx: 46,
      dw: 132,
      dh: 132,
    })
    draw.drawToImage().then(img => {
      this.setData({
        poster: img
      })
    })
    return;



    Promise.all([util.downloadImage(Image), util.downloadImage(qrcode)]).then(res => {
      if (this.suffix === 'bz') this.wallpaperPoster(Labels, ...res);
      else this.avatarEmotePoster(Labels, ...res)
    }).catch(e => {
      console.log(e)
    })
    // 
  },
  savePoster() {
    if (!this.data.poster) {
      return util.msg('图片未加载')
    }
    wx.saveImageToPhotosAlbum({
      filePath: this.data.poster,
      success: res => {
        util.msg('下载成功!');
        this.closePoster()
      },
      fail(e) {
        console.log(777, e)
      }
    })
  },
}