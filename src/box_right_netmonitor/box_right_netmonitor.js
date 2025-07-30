const app = getApp()
var timer = null

/**
 * 右侧滑动菜单组件
 * 用于显示可收缩的右侧固定浮动菜单
 */
Component({
  properties: {
    /**
     * 右侧滑动菜单盒子数据
     * @property {Object} boxdata - 包含菜单内容和布局的对象
     */
    boxdata: {
      type: Object,
      /**
       * 观察boxdata属性变化并处理菜单图片
       * @param {Object} newVal - 新的boxdata值
       * @param {Object} oldVal - 旧的boxdata值
       * @param {string} changedPath - 变化的属性路径
       */
      observer: function (newVal, oldVal, changedPath) {
        let that = this
        if (Object.keys(newVal).length > 0) {
          if (newVal.module_contents != null && newVal.module_contents.length > 0) {
            newVal.module_contents.forEach((w, j) => {
              newVal.module_contents[j].content = app.cropimg(w.content, w.attrs.width, w.attrs.height, 'crop', 1.5)
            })
          }
          that.setData({
            box: newVal,
          })
          that.v7getAllQueryInfo()
        }
      },
    },
    /**
     * box模块的id,用于视频播放的
     * @property {Number} boxid - 盒子组件的唯一标识
     */
    boxid: {
      type: Number,
      observer: function (newVal, oldVal, changedPath) {},
    },
    /**
     * 控制视频播放
     * @property {Boolean} videoisPlaying - 视频播放状态
     */
    videoisPlaying: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {},
    },
    /**
     * 盒子索引
     * @property {Number} boxindex - 在多盒子场景中的索引值
     */
    boxindex: {
      type: Number,
      observer: function (newVal, oldVal, changedPath) {},
    },
    /**
     * 控制弹出蒙版显示
     * @property {Boolean} showBoxPopupMask - 是否显示弹出蒙版
     */
    showBoxPopupMask: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {},
    },
    /**
     * 是否绑定手机号
     * @property {Boolean} boxbindmobile - 用户是否已绑定手机号
     */
    boxbindmobile: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {},
    },
  },
  data: {
    phone_number: '', //手机号
    leftbutton: 150, //右侧固定弹出浮动菜单
    animation: '', //右侧固定弹出浮动菜单
    hasOpenOut: 0, //右侧固定弹出浮动菜单
    windowHeight: 0,
  },
  /**
   * 组件初始化完成后执行
   * 获取用户手机号信息，设置窗口高度和动画
   */
  ready: function () {
    let that = this
    var users = wx.getStorageSync('user')
    if (users && users.phone_number) {
      that.setData({
        phone_number: users.phone_number,
      })
    }
    that.setData({
      windowHeight: wx.getSystemInfoSync().screenHeight,
    })
    that.animation = wx.createAnimation({
      duration: 600,
      timingFunction: 'linear',
      delay: 0,
      success: function (res) {},
    })

    wx.getSystemInfo({
      success: (res) => {
        let modelmes = res.model
        if (modelmes.search('iPhone') != -1) {
          if (res.windowHeight >= 812) {
            that.setData({
              leftbutton: 200,
            })
          }
        }
      },
    })
  },
  methods: {
    /**
     * 页面滚动事件处理
     * 根据滚动位置控制菜单展开收起动画
     * @param {Object} e - 滚动事件对象
     */
    onPageScroll(e) {
      let that = this
      if (e.scrollTop > 900) {
        that.animation.translate(-that.data.leftbuttonWidth + 35).step({
          duration: 600,
        })
        that.setData(
          {
            //输出动画
            animation: that.animation.export(),
          },
          () => {
            that.setData(
              {
                hasOpenOut: 1,
              },
              () => {}
            )
          }
        )
      }

      if (e.scrollTop <= 900 && that.data.animation != '') {
        that.animation.translate(0).step({
          duration: 600,
        })
        that.setData(
          {
            //输出动画
            animation: that.animation.export(),
          },
          () => {
            that.setData(
              {
                hasOpenOut: 0,
              },
              () => {}
            )
          }
        )
      }

      let show = parseInt(e.scrollTop) > that.data.windowHeight
      if ((show && this.data.visible) || (!show && !this.data.visible)) {
        return
      }
      that.setData({
        visible: show,
      })
    },
    /**
     * 更新手机号授权信息
     * 从缓存中读取并更新手机号
     */
    subinformphone() {
      //手机号授权更新
      let that = this
      var users = wx.getStorageSync('user')
      if (users && users.phone_number) {
        that.setData({
          phone_number: users.phone_number,
        })
      }
    },
    /**
     * 获取菜单元素尺寸信息
     * 用于计算菜单收缩展开动画
     */
    v7getAllQueryInfo() {
      let that = this
      const query = wx.createSelectorQuery().in(that)
      setTimeout(function () {
        query
          .select('#leftbutton')
          .boundingClientRect(function (res) {
            if (res) {
              that.setData({
                leftbuttonWidth: res.width,
              })
            }
          })
          .exec()
      }, 1000)
    },
    /**
     * 处理盒子蒙版事件
     * @param {Object} data - 蒙版事件数据
     */
    boxapplyMask(data) {
      let that = this
      let items = data.detail
      that.triggerEvent('boxapplyMask', items)
    },
    /**
     * 处理视频开始播放事件
     * @param {Object} data - 包含视频boxid的事件数据
     */
    boxbonplay(data) {
      let boxid = data.detail
      this.triggerEvent('boxbonplay', boxid)
    },
    /**
     * 处理视频暂停播放事件
     * @param {Object} data - 包含视频boxid的事件数据
     */
    boxonpause(data) {
      let boxid = data.detail
      this.triggerEvent('boxonpause', boxid)
    },
    /**
     * 点击菜单按钮展开菜单
     * 处理菜单展开动画
     */
    clickleftbutton: function () {
      var that = this
      if (that.data.hasOpenOut == 0) {
        that.animation.translate(-that.data.leftbuttonWidth + 40).step({
          duration: 600,
        })
        that.setData(
          {
            //输出动画
            animation: that.animation.export(),
          },
          () => {
            that.setData(
              {
                hasOpenOut: 1,
              },
              () => {}
            )
          }
        )
      }
    },
    /**
     * 处理手机绑定状态变更
     * @param {Object} data - 包含手机绑定状态的事件数据
     */
    mobliestatus(data) {
      let boxbindmobile = data.detail
      this.triggerEvent('mobliestatus', boxbindmobile)
    },
  },
})
