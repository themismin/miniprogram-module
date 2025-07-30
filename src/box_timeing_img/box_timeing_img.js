const app = getApp()
var timer = null

/**
 * 定时弹窗组件
 * 用于在页面加载后指定时间显示弹窗广告
 */
Component({
  properties: {
    /**
     * 定时弹窗盒子数据
     * @property {Object} boxdata - 包含定时弹窗内容和设置的对象
     */
    boxdata: {
      type: Object,
      /**
       * 观察boxdata属性变化并处理定时弹窗的显示逻辑
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
          if (newVal.module_contents != null) {
            //定时弹窗
            if (newVal.type == 'BOX_SHOW_WAY_TIMEING_IMG') {
              if (newVal.attribute != null && newVal.attribute != '') {
                if (newVal.attribute.timeing_popup_windows) {
                  timer = setTimeout(function () {
                    if (app.globalData.timingGroup[newVal.alias] != true) {
                      that.setData({
                        showTimgMask: true,
                      })
                    }
                    if (newVal.alias != '') {
                      app.globalData.timingGroup[newVal.alias] = true
                    }
                  }, Number(newVal.attribute.timeing_popup_windows) * 1000)
                }
              }
            }
          }

          that.setData({
            box: newVal,
          })
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
    showScreenMask: false, //开机屏
    showTimgMask: false, //定时弹窗显示状态
  },
  /**
   * 组件初始化完成后执行
   * 获取用户手机号信息
   */
  ready: function () {
    let that = this
    var users = wx.getStorageSync('user')
    if (users && users.phone_number) {
      that.setData({
        phone_number: users.phone_number,
      })
    }
  },
  methods: {
    /**
     * 页面滚动事件处理
     * @param {Object} e - 滚动事件对象
     */
    onPageScroll(e) {},
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
     * 关闭定时弹窗
     * 隐藏弹窗并更新全局状态
     */
    closetiming() {
      let that = this
      that.setData({
        showTimgMask: false,
      })
      app.globalData.timingGroup[that.properties.box.alias] = false
    },
    /**
     * 处理定时弹窗自动关闭
     * 延时关闭弹窗并更新全局状态
     * @param {Object} data - 事件数据
     */
    timeingMask(data) {
      let that = this
      setTimeout(function () {
        that.setData({
          showTimgMask: false,
        })
        app.globalData.timingGroup[that.properties.box.alias] = false
      }, 1000)
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
