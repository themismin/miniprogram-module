const app = getApp()
const boxbehavior = Behavior({
  data: {},
  ready: function () {
    let that = this
  },
  methods: {
    onPageScroll(e) {},

    /**
     * 更新手机号授权信息
     * 用于子组件更新用户手机号相关状态
     */
    subinformphone() {
      //手机号授权更新
      let that = this
      var users = wx.getStorageSync('user')
      that.setData({
        snsapi_phonenumber: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber(),
        phone_number: users.phone_number,
        userInfo: users,
      })
    },
    /**
     * 处理盒子应用蒙版事件
     * @param {Object} data - 事件数据
     */
    boxapplyMask(data) {
      let that = this
      let items = data.detail
      that.triggerEvent('boxapplyMask', items)
    },
    /**
     * 通知视频开始播放
     * @param {Object} data - 播放事件数据
     */
    boxbonplay(data) {
      let boxid = data.detail
      this.triggerEvent('boxbonplay', boxid)
    },
    /**
     * 通知视频暂停播放
     * @param {Object} data - 暂停事件数据
     */
    boxonpause(data) {
      let boxid = data.detail
      this.triggerEvent('boxonpause', boxid)
    },

    /**
     * 核心导航函数，处理所有点击跳转和交互行为
     * 根据operation_type类型执行不同操作
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

      switch (type) {
        case 'JUMP_LOCAL':
          //页面跳转
          let newtarget_address = ''
          newtarget_address = e.currentTarget.dataset.item.operation_attrs.target_address
          let new_pagePath = ''
          new_pagePath = _pagePath
          if (new_pagePath != newtarget_address) {
            if (e.currentTarget.dataset.item.operation_attrs.re_launch && e.currentTarget.dataset.item.operation_attrs.re_launch == '1') {
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
              // 视频号视频打开成功
            },
          })
          break
        case 'JUMP_OPENCHANNELUSERPROFILE':
          //打开视频号主页
          wx.openChannelsUserProfile({
            finderUserName: e.currentTarget.dataset.item.operation_attrs.finderUserName,
            success: function (res) {
              // 视频号主页打开成功
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
          // 弹窗确认报名

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
              phone_number: that.data.phone_number,
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
                      phone_number: that.data.phone_number,
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
        default:
          break
      }
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
      if (id) {
        newpath = `${r}id=${id}`
      } else {
        newpath = `${r}`
      }
      // console.log(newpath,'newpath')
      return newpath
    },
    //打开生成海报弹框
    /**
     * 生成海报
     * @param {string} url - 当前页面URL
     * @param {Object} visit_options - 页面参数
     * @param {string} poster_type - 海报类型
     */
    creadedposts(url, visit_options, poster_type) {
      let that = this
      let data = new Object()
      let urlpath = '/poster'
      data.id = visit_options.id ? visit_options.id : visit_options.scene

      data.poster_type = poster_type ? poster_type : 'rent_house'
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
    /**
     * 关闭海报弹窗
     */
    closeposter() {
      let that = this
      that.setData({
        showPosterMask: false,
      })
    },
  },
})
export { boxbehavior }
