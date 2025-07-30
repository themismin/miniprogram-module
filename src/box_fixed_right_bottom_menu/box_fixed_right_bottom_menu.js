const app = getApp()
var timer = null

/**
 * 右下角固定菜单组件
 * 用于显示固定在页面右下角的菜单项，自适应不同型号iPhone底部安全区
 */
Component({
  properties: {
    /**
     * 右下角菜单盒子数据
     * @property {Object} boxdata - 包含菜单内容和样式的对象
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
    fixedbutton: 220, //页面右下角固定菜单距离底部高度
  },
  /**
   * 组件初始化完成后执行
   * 检测设备型号并设置菜单距离底部的高度
   */
  ready: function () {
    let that = this
    wx.getSystemInfo({
      success: (res) => {
        let modelmes = res.model
        if (modelmes.search('iPhone X') != -1) {
          that.setData({
            fixedbutton: 240,
          })
        } else if (modelmes.search('iPhone 11') != -1) {
          that.setData({
            fixedbutton: 240,
          })
        } else if (modelmes.search('unknown<iPhone12,1>') != -1) {
          that.setData({
            fixedbutton: 240,
          })
        } else if (modelmes.search('unknown<iPhone12,5>') != -1) {
          that.setData({
            fixedbutton: 240,
          })
        } else if (modelmes.search('unknown<iPhone13,3>') != -1) {
          that.setData({
            fixedbutton: 240,
          })
        }
        if (modelmes.search('iPhone') != -1) {
          if (res.screenHeight >= 820) {
            that.setData({
              fixedbutton: 260,
            })
          }
        }
      },
    })
  },
  methods: {
    /**
     * 页面滚动事件处理
     * @param {Object} e - 滚动事件对象
     */
    onPageScroll(e) {
      let that = this
      let custom_modules
      custom_modules = that.selectComponent('#box_fixed_right_bottom_menu_container')
      if (custom_modules != null) {
        custom_modules.onPageScroll(e)
      }
    },
    /**
     * 更新手机号授权信息
     */
    subinformphone() {
      //手机号授权更新
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
     * 显示分享弹窗
     * 通知父组件显示分享弹窗界面
     */
    showShareboxpopup() {
      let that = this
      that.triggerEvent('showShareboxpopup')
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
