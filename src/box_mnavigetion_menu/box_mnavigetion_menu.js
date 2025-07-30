const app = getApp()
var timer = null

/**
 * 多栏导航菜单组件
 * 用于显示多列分类的导航菜单
 */
Component({
  properties: {
    /**
     * 导航菜单盒子数据
     * @property {Object} boxdata - 包含导航菜单项和布局的对象
     */
    boxdata: {
      type: Object,
      /**
       * 观察boxdata属性变化并处理菜单图片及数量
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
              if (newVal.module_contents[j].operation_attrs && newVal.module_contents[j].operation_attrs.after_content) {
                newVal.module_contents[j].operation_attrs.after_content = app.cropimg(w.operation_attrs.after_content, w.attrs.width, w.attrs.height, 'crop', 1.5)
              }
            })
          }
          let newcurrent = newVal
          if (newVal.attribute && newVal.attribute.pit_number && newVal.attribute.pit_number != '') {
            newcurrent.module_contents = newcurrent.module_contents.slice(0, Number(newVal.attribute.pit_number))
          }
          that.setData({
            box: newcurrent,
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
    onPageScroll(e) {
      let that = this
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
     * 处理手机绑定状态变更
     * @param {Object} data - 包含手机绑定状态的事件数据
     */
    mobliestatus(data) {
      this.setData({
        boxbindmobile: true,
      })
    },
  },
})
