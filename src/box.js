const app = getApp()
var timer = null
const skinBehavior = require('../../utils/skin/skinBehavior')
import { boxbehavior } from './boxbehavior.js'
Component({
  behaviors: [skinBehavior, boxbehavior],
  properties: {
    boxdata: {
      type: Object,
      observer: function (newVal, oldVal, changedPath) {
        let that = this
        // 当boxdata属性发生变化时，更新showway
        if (Object.keys(newVal).length > 0) {
          that.setData({
            showway: newVal.type,
          })
        }
      },
    },
    /**
     * box模块的id,用于视频播放的
     */
    boxid: {
      type: Number,
      observer: function (newVal, oldVal, changedPath) {},
    },
    /**
     * box模块的type
     */
    boxtype: {
      type: String,
      observer: function (newVal, oldVal, changedPath) {},
    },
    /**
     * 控制视频播放
     */
    videoisPlaying: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {},
    },
    /**
     *
     */
    boxindex: {
      type: Number,
      observer: function (newVal, oldVal, changedPath) {},
    },
    showBoxPopupMask: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {},
    },
    boxbindmobile: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {},
    },
    isOpenShare: {
      type: null,
      observer: function (newVal, oldVal, changedPath) {
        if (newVal) {
          this.setData({
            isOpen: true,
          })
        }
      },
    },
  },
  data: {
    phone_number: '', //手机号
    toastTemp: {
      text: '订阅成功',
      flag: 'none',
      bgc: '#fff',
      tc: '',
      src: 'https://guapikeji-1308841152.cos.ap-shanghai.myqcloud.com/assets/img/icon/common/success.png',
      url: '',
      style: 3,
      position: 'center',
      duration: -1, //不自动消失
    },
    postIMG: '', //生成海报图片
    showPostTips: true,
    postimwidth: '690',

    showpupopMask: false, // 弹框图片
    showapplypupopmask: false, //弹窗确认报名
    submitSwitch: true,
    showtopicpupop: false,
    settle_expert_goodsbox: [],
    showpadteuserinformation: false,
    updateuserinfoData: {},

    businesschannellist: [],
    businesschannelpage: 1,
    businesschannellast_page: 1,
    triggered: false, // 设置当前下拉刷新状态，true 表示下拉刷新已经被触发，false 表示下拉刷新未被触发
    showclosebusinesschannelbox: false,
    searchbusinesschannelinputValue: '',
    businesschannelid: '',
  },
  ready: function () {
    let that = this
    that.setData({
      boxbindmobile: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber() == '1' ? true : false,
      phone_number: wx.common.AuthorizationUserInfo.getUserPhone(),
      snsapi_phonenumber: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber(),
    })
    setTimeout(() => {
      that.setData({
        triggered: true,
      })
    }, 1000)
  },
  methods: {
    changeChild() {
      this.triggerEvent('childChange')
    },
    boxapplyMasks(data) {
      let that = this
      let items = data.detail
      var pages = getCurrentPages() //获取加载的页面
      var currentPage = pages[pages.length - 1] //获取当前页面的对象
      var url = currentPage.route //当前页面url
      var visit_options = currentPage.options
      // console.log(data,'11')
      switch (data.detail.type) {
        case 'APPLY_CONFIRM_POPUP':
          // 弹窗确认报名
          that.setData({
            showapplypupopmask: true,
            image_content: items.item.operation_attrs.image_content,
            text_content: items.item.operation_attrs.text_content,
          })
          break
        case 'ENLARGE_PICTURE_POPUP':
          //放大弹框图片
          that.setData({
            showpupopMask: true,
            pupopIMG: items.item.operation_attrs.image_content,
          })
          break
        case 'COMMIT_QUESTION':
          //提交问答
          that.getQaTags()
          that.setData({
            questionMask: true,
            isshowapply: true,
          })
          break
        case 'PAY_CHOOSE_TOPIC':
          let _currentPages = getCurrentPages()
          let _currentPage = _currentPages[_currentPages.length - 1]
          console.log(_currentPage, '_currentPage')
          _currentPage.data
          that.setData({
            settle_expert_goodsbox: _currentPage.data.postitem.settle_expert_goods,
            showtopicpupop: true,
          })
          break
        case 'CREATED_USER_INFO':
          that.setData({
            showpadteuserinformation: true,
            updateuserinfoData: items,
          })
          break
        case 'POPUP_CREATED_POST':
          // 生成海报
          console.log(data, 'e.currentTarget.dataset.item.operation_attrs.poster_type')
          let user_identities = wx.getStorageSync('user_identities')
          if (user_identities.INTERNAL_SALE && user_identities.INTERNAL_SALE != null) {
            that.getbusinesschannel()
            that.setData({
              showclosebusinesschannelbox: true,
              posterType: data.detail.item.operation_attrs.poster_type,
            })
          } else {
            that.creadedposts(url, visit_options, data.detail.item.operation_attrs.poster_type)
          }
          break
        case 'POPUP_CREATED_CARD':
          // 生成名片
          // 调用创建名片方法
          that.createCard(data.detail.item.operation_attrs)
          break

        default:
          break
      }
    },

    //与page里面的onReachBottom一样的效果
    onReachBottom() {},
    onPageScroll(e) {
      let that = this
      let custom_modules
      custom_modules = that.selectComponent('#v7boxmodules_' + that.data.boxdata.id)
      if (custom_modules != null) {
        custom_modules.onPageScroll(e)
      }
    },
    subinformphone() {
      //手机号授权更新
      let that = this
      let custom_modules
      custom_modules = that.selectComponent('#v7boxmodules_' + that.data.boxdata.id)
      if (custom_modules != null) {
        custom_modules.subinformphone()
      }
    },
    onPullDownRefresh() {},
    onHide() {},
    v7getAllQueryInfo(pageinfo) {
      let that = this
      let custom_module
      custom_module = that.selectComponent('#v7boxmodules_' + that.data.boxdata.id)
    },
    boxbonplay(data) {
      let boxid = data.detail
      this.triggerEvent('boxbonplay', boxid)
    },
    boxonpause(data) {
      let boxid = data.detail
      this.triggerEvent('boxonpause', boxid)
    },
    mobliestatus(data) {
      this.setData({
        boxbindmobile: true,
      })
    },

    previewImg: function (e) {
      var that = this

      var imgUrlCurrent = e.currentTarget.dataset.img
      let newurlCurrent = ''
      // 处理图片URL中可能的查询参数
      if (imgUrlCurrent.indexOf('?') != -1) {
        newurlCurrent = imgUrlCurrent.substring(0, imgUrlCurrent.indexOf('?'))
      } else {
        newurlCurrent = imgUrlCurrent
      }
      // newurlCurrent = newurlCurrent+'?imageView2/2/w/1125/auto-orient'
      newurlCurrent = app.cropimg(newurlCurrent, 1125, 0, 'cropwidth', 1.5)
      wx.previewImage({
        current: newurlCurrent,
        urls: [newurlCurrent], // 需要预览的图片http链接列表
      })
    },
    closepupopMask() {
      let that = this
      that.setData({
        showpupopMask: false,
      })
    },
    _applypupopmasklosed() {
      let that = this
      that.setData({
        showapplypupopmask: false,
      })
    },
    BindapplyPupopPhoneNumber(e) {
      let that = this
      wx.common.AuthorizationPhone.getPhoneNumber(e, {
        success: function (res) {
          that.setData({
            snsapi_phonenumber: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber(),
            phone_number: wx.common.AuthorizationUserInfo.getUserPhone(),
            users: wx.common.AuthorizationUserInfo.getUserInfoMessage(),
          })
          //通知全局的手机号认证
          that.triggerEvent('mobliestatus', true)
          that.applyPupop()
        },
        fail: function (res) {
          // 手机号绑定失败处理
        },
      })
    },
    applyPupop() {
      let that = this
      wx.common.ApplyInfo.ApplySubmit(
        {
          type: 'APPLY_POPUP',
          model_type: '',
          model_id: '',
          user_name: that.data.users ? that.data.users.nickname : '',
          phone_number: that.data.phone_number,
        },
        (res) => {
          if (res.code == '200') {
            that.setData({
              showapplypupopmask: false,
              image_content: '',
              text_content: '',
            })
            wx.showToast({
              title: '报名成功',
              icon: 'none',
              duration: 1500,
            })
          } else {
            wx.showToast({
              title: '报名失败，请联系客服',
              icon: 'none',
              duration: 1500,
            })
          }
        }
      )
    },
    getQaTags() {
      let that = this
      app.request({
        url: wx.path.QUESTIONTAGS,
        data: {},
        success: function (res) {
          let { data } = res.data
          data.forEach((v, i) => {
            if (v.children && v.children.length > 0) {
              v.children.forEach((w, j) => {
                w.active = 0
              })
            }
          })
          that.setData({
            houseTags: data,
          })
        },
        fail: function (res) {},
      })
    },
    _applyclosed() {
      let that = this
      that.setData({
        questionMask: false,
        isshowapply: false,
        submitSwitch: true,
      })
    },

    _setacreageIndex: function (e) {
      const dataset = e.currentTarget.dataset
      if (this.data.houseTags[dataset.index].children[dataset.subindex].active == 1) {
        this.data.houseTags[dataset.index].children[dataset.subindex].active = 0
      } else {
        this.data.houseTags[dataset.index].children[dataset.subindex].active = 1
      }
      this.setData({
        houseTags: this.data.houseTags,
      })
    },
    _nameinputHandle: function (e) {
      var key = e.target.dataset.name
      var value = e.detail.value
      var data = {}
      data[key] = value
      this.setData(data)
    },
    //验证
    _validate: function (cb) {
      let question_tag_ids = []
      for (const key in this.data.houseTags) {
        if (Object.hasOwnProperty.call(this.data.houseTags, key)) {
          const element = this.data.houseTags[key]
          if (element.children && element.children.length > 0) {
            element.children.forEach((v, i) => {
              if (v.active == 1) {
                question_tag_ids.push(v.id)
              }
            })
          }
        }
      }
      this.setData({
        question_tag_ids: question_tag_ids,
      })
      if (!this.data.content) {
        wx.showToast({
          title: '请输入描述您的问题',
          icon: 'none',
        })
        return
      }
      var data = {
        question_tag_ids: this.data.question_tag_ids,
        content: this.data.content,
      }
      return cb(data)
    },
    _submitapply() {
      let that = this
      that._validate(function (data) {
        if (that.data.submitSwitch) {
          that.setData({
            submitSwitch: false,
          })
          app.request({
            url: wx.path.QUESTIONSUBMIT,
            data: {
              content: data.content,
              question_tag_ids: data.question_tag_ids,
            },
            success: function (res) {
              that.setData({
                submitSwitch: true,
                questionMask: false,
                question_tag_ids: [],
                questionList: [],
                page: 1,
                content: '',
              })

              wx.showToast({
                title: '提交成功',
                icon: 'none',
                duration: 3000,
              })
            },
          })
        }
      })
    },
    _chooseorderclose() {
      let that = this
      that.setData({
        showtopicpupop: false,
      })
    },
    _setCurrentValue(e) {
      let that = this
      let { item } = e.currentTarget.dataset
      // that.data.settle_expert_goodsbox.find(
      //   (x) => x.id === item.id
      // ).tempactive = !e.currentTarget.dataset.tempactive;
      if (that.data.settle_expert_goodsbox.length > 0) {
        that.data.settle_expert_goodsbox.forEach((v, i) => {
          if (v.id == item.id) {
            v.tempactive = true
          } else {
            v.tempactive = false
          }
        })
      }
      // that.data.settle_expert_goodsbox.find(
      //     (x) => x.id !== item.id
      //   ).tempactive = e.currentTarget.dataset.tempactive;
      that.setData({
        [`settle_expert_goodsbox`]: that.data.settle_expert_goodsbox,
      })
    },
    _gotoOrder() {
      let that = this
      // console.log(that.data.settle_expert_goodsbox)
      let Id = null
      if (that.data.settle_expert_goodsbox.length > 0) {
        that.data.settle_expert_goodsbox.forEach((v, i) => {
          if (v.tempactive) {
            Id = v.id
          }
        })
      }
      if (Id != null) {
        app.navigator.navigateTo({
          url: `/pages/settleexpert/order/index?id=${Id}`,
        })
      } else {
        wx.common.showtoastmessage('请选择约聊到的话题', !1, 'error')
      }
    },
    _getnewestuserinfo(e) {
      // 使用存储的用户信息数据创建新的事件对象
      let newe = {
        currentTarget: {
          dataset: this.data.updateuserinfoData,
        },
      }
      this.gotoTarget(newe)
    },
    getbusinesschannel(type) {
      let that = this
      let items = that.data.businesschannellist
      app.request({
        url: wx.path.BUSINESSCHANNELLISTS,
        method: 'POST',
        data: {
          page: that.data.businesschannelpage,
          search_keyword: that.data.searchbusinesschannelinputValue,
        },
        success: function (res) {
          if (res.data.code == 200) {
            let { data } = res.data
            if (type == 'moredata') {
              that.setData({
                businesschannellist: items.concat(data.data),
              })
            } else {
              that.setData({
                businesschannellist: data.data,
                businesschannellast_page: data.last_page,
              })
            }
          }
        },
      })
    },
    searchbusinesschannelSubmit(e) {
      let that = this
      let value = e.detail.value
      that.setData({
        businesschannelpage: 1,
        searchbusinesschannelinputValue: value,
      })
      that.getbusinesschannel('firstdata')
    },
    // 自定义下拉刷新控件被下拉
    onPulling(e) {
      console.log('onPulling:', e)
    },
    // 自定义下拉刷新被触发
    onRefresh() {
      console.log('onRefresh')
      if (this._freshing) return
      this._freshing = true
      setTimeout(() => {
        this.setData({
          triggered: false,
        })
        this._freshing = false
      }, 3000)
    },
    // 自定义下拉刷新被复位
    onRestore(e) {
      console.log('onRestore:', e)
    },
    // 自定义下拉刷新被中止
    onAbort(e) {
      console.log('onAbort', e)
    },
    // 滚动到底部
    onLower(e) {
      console.log('onTolower', e)
      let that = this
      that.setData({
        businesschannelpage: that.data.businesschannelpage + 1,
      })
      if (that.data.businesschannelpage > that.data.businesschannellast_page) {
        return false
      } else {
        that.getbusinesschannel('moredata')
      }
      // if(that.data.businesschannelpage:1,
      // businesschannellast_page:1,)
    },
    closebusinesschannelposter() {
      let that = this
      that.setData({
        showclosebusinesschannelbox: false,
      })
    },
    showcreatedpost(e) {
      console.log(e, 'e')
      let that = this
      var pages = getCurrentPages() //获取加载的页面
      var currentPage = pages[pages.length - 1] //获取当前页面的对象
      var url = currentPage.route //当前页面url
      var visit_options = currentPage.options
      that.setData(
        {
          businesschannelid: e.currentTarget.dataset.item.id,
        },
        () => {
          that.creadedposts(url, visit_options, that.data.posterType)
        }
      )
    },
    // 打开生成名片弹窗
    createCard(operation_attrs) {
      const that = this
      const card_type = operation_attrs.card_type
      const target_address = operation_attrs.target_address || ''
      if (!card_type || !target_address) {
        return
      }
      app.request({
        url: '/base/business-card/generate',
        method: 'POST',
        data: {
          card_type: card_type,
          target_address: target_address,
        },
        success: function (res) {
          console.log(res)
          if (res.data.code == 200) {
            const url = res.data.data.cos_path
            app.createdPost(url, () => {
              that.openCardModal(url)
            })
          } else {
            wx.showToast({
              title: res.data.message || '生成名片失败',
              icon: 'none',
            })
          }
        },
      })
    },
    openCardModal(imgUrl) {
      if (!imgUrl) {
        return
      }
      this.setData({
        maskcontentheight: '1000',
        postimheight: '800',
        postimwidth: '688',
        showPosterMask: true,
      })
      this.setData({
        postIMG: imgUrl,
        showclosebusinesschannelbox: false,
        showPostTips: false,
      })
    },

    //打开生成海报弹框
    creadedposts(url, visit_options, poster_type) {
      let that = this
      let data = new Object()
      let urlpath = '/poster'
      data.id = visit_options.id ? visit_options.id : visit_options.scene

      data.poster_type = poster_type ? poster_type : 'rent_house'
      data.fbcid = that.data.businesschannelid
      switch (poster_type) {
        case 'rent_house':
          that.setData({
            maskcontentheight: '1101', //生成海报外框的高度 相差248
            postimheight: '853', //生成海报图片高度
            postimwidth: '450',
          })
          break
        case 'house':
          that.setData({
            maskcontentheight: '1372', //生成海报外框的高度 相差248
            postimheight: '1124', //生成海报图片高度
            postimwidth: '690',
          })
          break
        default:
          that.setData({
            maskcontentheight: '794', //生成海报外框的高度 相差248
            postimheight: '546', //生成海报图片高度
            postimwidth: '450',
          })
          break
      }

      app.request({
        url: urlpath,
        method: 'POST',
        data: data,
        success: function (resp) {
          app.createdPost(resp.data.data, () => {
            that.setData({
              postIMG: resp.data.data,
              showclosebusinesschannelbox: false,
            })
            console.log(poster_type)
            switch (poster_type) {
              case 'rent_house':
                that.setData({
                  showPosterMask: true,
                })
                break
              case 'house':
                that.setData({
                  showPosterMask: true,
                })
                break
              default:
                that.setData({
                  showPosterMask: true,
                })
                break
            }
          })
        },
      })
    },
    closeposter() {
      let that = this
      that.setData({
        showPosterMask: false,
      })
    },
    notifyWechatPay(e) {
      this.triggerEvent('wechatPay')
    },
  },
})
