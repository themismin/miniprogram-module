const app = getApp()
const skinBehavior = require('../../utils/skin/skinBehavior')
Component({
  behaviors: [skinBehavior],
  properties: {
    boxcontainer: {
      type: Object,
      observer: function (newVal, oldVal, changedPath) {
        if (Object.keys(newVal).length > 0) {
          if (newVal.operation_type == 'PLAY_VIDEO') {
            this.initData()
            if (newVal.operation_attrs.videoautoplay == '1') {
              //视频自动播放
              this.controlVideo()
            }
          }
          if (newVal.style && newVal.style != '' && newVal.style != null) {
            this.setData({
              boxcontainerheight: Number(newVal.style.height) + 1,
            })
          }
        }
      },
    },
    boxid: {
      type: Number,
      observer: function (newVal, oldVal, changedPath) {},
    },
    videoisPlaying: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {
        if (newVal && newVal === true) {
          this.videoPlay()
        } else {
          this.videoPause()
        }
      },
    },
    boxbindmobile: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {
        let that = this
        if (newVal) {
          var users = wx.getStorageSync('user')
          if (users && users.phone_number) {
            that.setData({
              snsapi_phonenumber: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber(),
              phone_number: wx.common.AuthorizationUserInfo.getUserPhone(),
            })
          }
        } else {
          that.setData({
            snsapi_phonenumber: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber(),
          })
        }
      },
    },
  },
  data: {
    snsapi_phonenumber: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber(),
    phone_number: '', //手机号
    showPosterMask: false, //生成海报开关

    pupopIMG: '',
    postIMG: '', //生成海报图片
    maskcontentheight: '', //生成海报外框的高度
    postimheight: '', //生成海报图片高度
    postimwidth: '690',
    autoplay: false,
    play: false,
    fullScreen: false,
    videoindexCurrent: null,
    visible: false,
    toggle: true,
    windowHeight: 0,
  },
  ready: function () {
    var that = this
    that.setData({
      snsapi_phonenumber: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber(),
      phone_number: wx.common.AuthorizationUserInfo.getUserPhone(),
      users: wx.common.AuthorizationUserInfo.getUserInfoMessage(),
    })

    that.setData({
      windowHeight: wx.getSystemInfoSync().screenHeight,
    })
    app.globalData.UserInfoStatusCallback = (data) => {
      if (app.globalData.UserInfoStatus == '1') {
        that.setData({
          snsapi_phonenumber: data.snsapi_phonenumber,
        })
      }
    }
    let pages = getCurrentPages()
    let currentPage = null
    let _pagePath = null
    if (pages.length > 0) {
      currentPage = pages[pages.length - 1]
      _pagePath = currentPage.route
    }
  },
  methods: {
    /**
     * 页面滚动事件处理函数
     * @param {Object} e - 滚动事件对象，包含scrollTop等信息
     */
    onPageScroll(e) {
      let that = this
      let show = parseInt(e.scrollTop) > that.data.windowHeight
      if ((show && this.data.visible) || (!show && !this.data.visible)) {
        return
      }
      that.setData({
        visible: show,
      })
    },
    /**
     * 从URL路径中解析参数
     * @param {string} path - 包含查询参数的URL路径
     * @return {Object} 解析后的参数对象
     */
    getUrlParam(path) {
      if (path.indexOf('?') == -1) return ''
      var t = {}
      return (
        path
          .split('?')[1]
          .split('&')
          .forEach(function (n) {
            var e = n.split('=')[1]
            t[n.split('=')[0]] = e
          }),
        t
      )
    },
    /**
     * 向路径添加参数，构建新URL
     * @param {string} path - 原始URL路径
     * @param {string|number} id - 要添加的ID参数
     * @return {string} 添加参数后的新路径
     */
    addpathsrc(path, id) {
      var t = this.getUrlParam(path),
        e = {}
      var r = ''
      if (((r = path.indexOf('?') == -1 ? path + '?' : path.substr(0, path.indexOf('?')) + '?'), '' !== t)) for (var o in t) e[o] = t[o]
      for (var i in e) i.indexOf('zjlj') == -1 && (r += i + '=' + e[i] + '&')
      let newpath = ''
      // 构建最终路径，带上id参数或不带
      if (id) {
        newpath = `${r}id=${id}`
      } else {
        newpath = `${r}`
      }
      return newpath
    },
    /**
     * 发送模块点击日志
     * @param {Object} item - 被点击的模块内容对象
     */
    sendClickLog(item) {
      const params = {
        module_content_id: item.id,
      }
      app.request(
        {
          url: '/log/module-create',
          method: 'POST',
          data: params,
        },
        false
      )
    },
    /**
     * 处理点击事件，根据不同operation_type执行不同操作
     * @param {Object} e - 点击事件对象
     */
    gotoTarget(e) {
      let that = this
      let type = e.currentTarget.dataset.item.operation_type
      let item = e.currentTarget.dataset.item
      var pages = getCurrentPages() //获取加载的页面
      var currentPage = pages[pages.length - 1] //获取当前页面的对象
      var url = currentPage.route //当前页面url
      var visit_options = currentPage.options
      let _pagePath = currentPage.route
      _pagePath.indexOf('/') != 0 && (_pagePath = '/' + _pagePath)

      let currentboxdata = new Object()
      this.sendClickLog(item)

      switch (type) {
        case 'JUMP_LOCAL':
          //页面跳转
          let newtarget_address = ''
          newtarget_address = e.currentTarget.dataset.item.operation_attrs.target_address
          let new_pagePath = ''
          new_pagePath = _pagePath
          if (new_pagePath != newtarget_address) {
            if (e.currentTarget.dataset.item.operation_attrs.re_launch) {
              app.navigator.navigateTo(
                {
                  url: newtarget_address,
                },
                e.currentTarget.dataset.item.operation_attrs.re_launch
              )
            } else {
              app.navigator.navigateTo({
                url: newtarget_address,
              })
            }
          }
          break

        case 'JUMP_HOUSE_PATH':
          // 详情页跳转路径
          let newtarget_address2 = ''
          newtarget_address2 = that.addpathsrc(e.currentTarget.dataset.item.operation_attrs.target_address, visit_options.id)
          app.navigator.navigateTo({
            url: `${newtarget_address2}`,
          })
          break
        case 'OPEN_EXTERNAL_LINK':
          // 打开外部链接
          let newtarget_address4 = ''
          newtarget_address4 = that.addpathsrc(e.currentTarget.dataset.item.operation_attrs.target_address, visit_options.id)
          app.navigator.navigateTo({
            url: `/pages/webview/index?url=${encodeURIComponent(newtarget_address4)}`,
          })
          break
        case 'JUMP_DETAILS_PATH':
          // 详情页跳转路径
          let newtarget_address3 = ''
          newtarget_address3 = that.addpathsrc(e.currentTarget.dataset.item.operation_attrs.target_address, visit_options.id)
          app.navigator.navigateTo({
            url: `${newtarget_address3}`,
          })
          break
        case 'JUMP_IDENTITY':
          // 身份跳转
          app.navigator.navigateTo({
            url: e.currentTarget.dataset.item.operation_attrs.whether_identity == 1 ? e.currentTarget.dataset.item.operation_attrs.target_identity_address : e.currentTarget.dataset.item.operation_attrs.target_address,
          })
          break
        case 'CONSULTING':
          //1V1咨询
          let phone = e.currentTarget.dataset.item.operation_attrs.phone_number
          if (phone != '' && phone != null) {
            wx.makePhoneCall({
              phoneNumber: phone,
            })
          }
          break
        case 'JUMP_OPENCHANNELSACTIVITY':
          //打开视频号视频
          wx.openChannelsActivity({
            finderUserName: e.currentTarget.dataset.item.operation_attrs.finderUserName,
            feedId: e.currentTarget.dataset.item.operation_attrs.feedId,
            success: function (res) {
              // 视频号视频打开成功回调
            },
          })
          break
        case 'JUMP_OPENCHANNELUSERPROFILE':
          //打开视频号主页
          wx.openChannelsUserProfile({
            finderUserName: e.currentTarget.dataset.item.operation_attrs.finderUserName,
            success: function (res) {
              // 视频号主页打开成功回调
            },
          })
          break
        case 'COPY':
          //复制内容
          let copytext = e.currentTarget.dataset.item.operation_attrs.copy_text
          let copycontent = e.currentTarget.dataset.item.operation_attrs.copy_content
          wx.setClipboardData({
            data: copycontent,
            success: function (res) {
              wx.getClipboardData({
                success: function (res) {
                  wx.showToast({
                    title: copytext,
                  })
                },
              })
            },
          })
          break
        case 'APPLY_POPUP':
          //报名弹窗
          break
        case 'COMMIT_QUESTION':
          //提交问答
          currentboxdata.item = e.currentTarget.dataset.item
          currentboxdata.type = 'COMMIT_QUESTION'
          that.triggerEvent('boxapplyMask', currentboxdata)
          break
        case 'PAY_CHOOSE_TOPIC':
          // 专家付费选择话题弹框
          currentboxdata.item = e.currentTarget.dataset.item
          currentboxdata.type = 'PAY_CHOOSE_TOPIC'
          that.triggerEvent('boxapplyMask', currentboxdata)
          break
        case 'APPLY_CONFIRM_POPUP':
          // 弹窗确认报名，通知父组件显示报名弹窗
          currentboxdata.item = e.currentTarget.dataset.item
          currentboxdata.type = 'APPLY_CONFIRM_POPUP'
          that.triggerEvent('boxapplyMask', currentboxdata)
          break
        case 'ONE_CLICK_APPLY':
          //一键报名
          wx.common.ApplyInfo.ApplySubmit(
            {
              type: 'ONE_CLICK_APPLY',
              model_type: '',
              model_id: '',
              user_name: that.data.users ? that.data.users.nickname : '',
              phone_number: wx.common.AuthorizationUserInfo.getUserPhone(),
            },
            (res) => {
              if (res.code == '200') {
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
          break
        case 'ENLARGE_PICTURE_POPUP':
          // 放大弹框图片
          currentboxdata.item = e.currentTarget.dataset.item
          currentboxdata.type = 'ENLARGE_PICTURE_POPUP'
          that.triggerEvent('boxapplyMask', currentboxdata)
          break
        case 'ENLARGE_PICTURE':
          //放大图片
          let newurl = ''
          if (e.currentTarget.dataset.item.operation_attrs.image_content.indexOf('?') != -1) {
            newurl = e.currentTarget.dataset.item.operation_attrs.image_content.substring(0, e.currentTarget.dataset.item.operation_attrs.image_content.indexOf('?'))
          } else {
            newurl = e.currentTarget.dataset.item.operation_attrs.image_content
          }
          // 使用应用的裁剪函数处理图片URL
          newurl = app.cropimg(newurl, 1125, 0, 'cropwidth', 1.5)
          wx.previewImage({
            urls: [newurl], // 需要预览的图片http链接列表
          })

          break
        case 'BOX_SCROLL_TO_TOP':
          //回到顶部
          if (wx.pageScrollTo) {
            wx.pageScrollTo({
              scrollTop: 0,
            })
          } else {
            wx.showModal({
              title: '提示',
              content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。',
            })
          }
          break
        case 'POPUP_CREATED_POST':
          //生成海报，通知父组件处理
          currentboxdata.item = e.currentTarget.dataset.item
          currentboxdata.type = 'POPUP_CREATED_POST'
          that.triggerEvent('boxapplyMask', currentboxdata)
          break
        case 'POPUP_CREATED_CARD':
          // 生成名片，通知父组件处理
          currentboxdata.item = e.currentTarget.dataset.item
          currentboxdata.type = 'POPUP_CREATED_CARD'
          that.triggerEvent('boxapplyMask', currentboxdata)
          break
        case 'OPEN_MINIPROGRAM':
          let copytext1 = e.currentTarget.dataset.item.operation_attrs.copy_text
          let copycontent2 = e.currentTarget.dataset.item.operation_attrs.copy_content
          wx.setClipboardData({
            data: copycontent2 ? copycontent2 : 'guapikeji',
            success: function (res) {
              wx.getClipboardData({
                success: function (res) {
                  app.request({
                    method: 'POST',
                    url: wx.path.APPLYOPENAPPSUBMIT,
                    data: {
                      user_name: that.data.users ? that.data.users.nickname : '',
                      phone_number: wx.common.AuthorizationUserInfo.getUserPhone(),
                    },
                    success: function (res) {
                      wx.showToast({
                        title: copytext1 ? copytext1 : '微信号已复制',
                      })
                    },
                    fail: function (res) {},
                  })
                },
              })
            },
          })
          break
        case 'SEE_PDF':
          if (e.currentTarget.dataset.item.operation_attrs.pdf_file) {
            wx.downloadFile({
              url: e.currentTarget.dataset.item.operation_attrs.pdf_file,
              filePath: '',
              success: function (res) {
                // 获取临时文件路径打开PDF
                const filePath = res.tempFilePath
                wx.openDocument({
                  filePath: filePath,
                  showMenu: true,
                  fileType: 'pdf',
                  success: function (res) {},
                })
              },
              fail: function (res) {
                wx.hideLoading()
              },
            })
          }

          break
        case 'LOTTERY_ACTIVITY_SCAN_QR':
          wx.scanCode({
            success(res) {
              // 扫码成功后发送核销请求
              app.request({
                url: wx.path.DOINGUSERWRITEOFF,
                method: 'POST',
                data: {
                  uuid: res.result,
                },
                success: function (res) {
                  if (res.data.code == 200) {
                    let { data } = res.data
                    wx.showToast({
                      title: '核销成功',
                      icon: 'none',
                    })
                  } else {
                    wx.showToast({
                      title: res.data.data.message,
                      icon: 'none',
                    })
                  }
                },
              })
            },
          })
          break
        default:
          break
      }
    },
    /**
     * 处理需要用户授权的点击事件
     * @param {Object} e - 点击事件对象
     */
    /**
     * 处理需要用户授权的点击事件
     * @param {Object} e - 点击事件对象
     */
    /**
     * 处理需要用户授权的点击事件
     * @param {Object} e - 点击事件对象
     */
    userinfoTarget(e) {
      let currentboxdata = {}
      let that = this

      if (wx.common.AuthorizationUserInfo.getsnsapi_userinfo() == 1) {
        that.gotoTarget(e)
      } else {
        currentboxdata.item = e.currentTarget.dataset.item
        currentboxdata.type = 'CREATED_USER_INFO'
        that.triggerEvent('boxapplyMask', currentboxdata)
      }
    },
    /**
     * 绑定用户手机号回调
     * @param {Object} e - 获取手机号事件对象
     */
    BindPhoneNumber(e) {
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
          that.gotoTarget(e)
        },
        fail: function (res) {
          // 手机号绑定失败的处理
        },
      })
    },

    /**
     * 初始化视频组件数据
     */
    initData() {
      let that = this
      let videoContext = wx.createVideoContext('boxvideo', that)
      that.setData({
        videoContext,
      })
    },
    //视频自动播放
    /**
     * 监听视频组件在视口中的位置，自动播放或暂停
     */
    subscribePosition() {
      let that = this
      wx.createIntersectionObserver(that)
        .relativeToViewport()
        .observe('.video--wrap', (res) => {
          if (res && res.intersectionRatio > 0) {
            that.videoPlay()
          } else {
            that.videoPause()
          }
        })
    },
    /**
     * 播放视频并设置相关状态
     */
    videoPlay() {
      const { videoContext } = this.data
      if (this.properties.boxcontainer.operation_attrs.videoclick == 'overallsituation') {
        //全屏播放
        videoContext.requestFullScreen({
          direction: 90,
        })
      }
      videoContext.play()
      this.setData({
        play: true,
        autoplay: true,
      })
    },
    /**
     * 暂停视频播放并更新状态
     */
    /**
     * 暂停视频播放并更新状态
     */
    videoPause() {
      const { videoContext } = this.data
      videoContext.pause()
      this.setData({
        play: false,
        autoplay: false,
      })
    },
    /**
     * 控制视频播放，并触发全局播放事件
     */
    controlVideo() {
      let that = this
      that.videoPlay()
      if (that.properties.boxcontainer.operation_attrs.videoautoplay != '1') {
        that.triggerEvent('boxbonplay', that.properties.boxid)
      }
    },
    /**
     * 处理视频全屏状态变化
     */
    handleFullScreenChange() {
      const { fullScreen, videoContext } = this.data
      this.setData({
        fullScreen: !fullScreen,
      })
      // 切换全屏状态
      if (fullScreen == true) {
        videoContext.stop()
        this.setData({
          play: false,
          autoplay: false,
        })
      }
    },
    /**
     * 视频播放结束处理函数
     */
    handleVideoEnded() {
      let that = this
      let videoContext = wx.createVideoContext('boxvideo', that)
      videoContext.stop()
      that.setData({
        play: false,
        autoplay: false,
      })
      that.triggerEvent('boxonpause', that.properties.boxid)
    },
    /**
     * 跳转到顾问详情页
     * @param {Object} e - 点击事件对象
     */
    showconsultantmainTarget(e) {
      let consultantid = e.currentTarget.dataset.consultantid
      app.navigator.navigateTo({
        url: '/packageConsultant/pages/consultantmain/index?consultant_id=' + consultantid,
      })
    },
    /**
     * 处理微信支付请求
     */
    paymentdata() {
      app.request({
        url: wx.path.PAYMENTWECHATUNIFIEDORDER,
        data: {},
        success: function (res) {
          if (res.data.code == 200) {
            let { config, out_trade_no } = res.data.data
            wx.requestPayment({
              timeStamp: config.timeStamp,
              nonceStr: config.nonceStr,
              package: config.package,
              signType: config.signType,
              paySign: config.paySign,
              success(resp) {
                app.request({
                  url: wx.path.PAYMENTWCHATQUERY,
                  data: {
                    out_trade_no: out_trade_no,
                  },
                  success: function (respp) {
                    console.log(respp, 'respp')
                    wx.common.showtoastmessage(respp.data.data, !1, 'error')
                  },
                })
              },
              fail(res) {},
            })
          }
        },
        fail: function (res) {},
      })
    },
    /**
     * 通知父组件触发微信支付
     * @param {Object} e - 点击事件对象
     */
    notifyWechatPay(e) {
      this.triggerEvent('wechatPay')
    },
  },
})
