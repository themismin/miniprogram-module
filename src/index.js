const app = getApp()

/**
 * 模块化盒子主组件，用于加载和渲染自定义模块
 */
Component({
  properties: {
    /**
     * 传入的模块数据
     * @property {Object} data - 包含组件所需的全部数据
     */
    data: {
      type: Object,
      /**
       * 观察data属性变化并更新组件状态
       * @param {Object} newVal - 新的data值
       * @param {Object} oldVal - 旧的data值
       * @param {string} changedPath - 变化的属性路径
       */
      observer: function (newVal, oldVal, changedPath) {
        if (Object.keys(newVal).length > 0) {
          this.setData({
            //boxdata: newVal.new_box,
            boxdata: newVal.custom_box,
            boxid: newVal.id,
            boxtitle: newVal.attributes.title,
            boxtitlestyle: newVal.attributes.more,
          })
        }
      },
    },
    /**
     * 视频播放状态
     * @property {Boolean} videoisPlaying - 控制视频是否正在播放
     */
    videoisPlaying: {
      type: Boolean,
      observer: function (newVal, oldVal, changedPath) {},
    },
    /**
     * 盒子索引，用于多盒子场景
     * @property {Number} boxindex - 当前盒子的索引值
     */
    boxindex: {
      type: Number,
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
    isOpenShare: false,
  },
  /**
   * 组件初始化完成后执行
   */
  ready: function () {
    var that = this
    that.v7getAllQueryInfo({
      pageScrollTop: 0,
    })
  },
  methods: {
    /**
     * 子组件状态变化处理函数
     * @param {Object} e - 事件对象
     */
    childChange(e) {
      this.setData({
        isOpenShare: true,
      })
    },
    /**
     * 页面滚动事件处理
     * @param {Object} e - 滚动事件对象
     */
    onPageScroll(e) {
      let that = this
      let custom_modules
      custom_modules = that.selectComponent('#v7boxmodules_' + that.data.boxdata.id)
      if (custom_modules != null) {
        custom_modules.onPageScroll(e)
      }
    },
    /**
     * 页面准备完成生命周期函数
     */
    onReady: function () {},
    /**
     * 页面显示生命周期函数
     */
    onShow: function () {},
    /**
     * 页面隐藏生命周期函数
     */
    onHide: function () {},
    /**
     * 页面卸载生命周期函数
     */
    onUnload: function () {},
    /**
     * 下拉刷新事件处理
     */
    onPullDownRefresh: function () {
      let that = this
      let custom_modules
      custom_modules = that.selectComponent('#v7boxmodules_' + that.data.boxdata.id)
      if (custom_modules != null) {
        custom_modules.onPullDownRefresh()
      }
    },
    /**
     * 页面触底事件处理
     */
    onReachBottom: function () {},
    /**
     * 获取页面信息
     * @param {Object} pageinfo - 页面信息对象
     */
    v7getAllQueryInfo(pageinfo) {
      let that = this
      let custom_module
      custom_module = that.selectComponent('#v7boxmodules_' + that.data.boxdata.id)
    },
    /**
     * 更新手机号授权状态
     * 通知子模块更新手机号相关信息
     */
    subinformphone() {
      //手机号授权更新
      let that = this
      let custom_modules
      custom_modules = that.selectComponent('#v7boxmodules_' + that.data.boxdata.id)
      if (custom_modules != null) {
        custom_modules.subinformphone()
      }
    },
    /**
     * 视频开始播放事件处理
     * @param {Object} data - 包含视频ID的事件数据
     */
    boxbonplay(data) {
      let boxid = data.detail
      this.triggerEvent('boxbonplay', boxid)
    },
    /**
     * 视频暂停播放事件处理
     * @param {Object} data - 包含视频ID的事件数据
     */
    boxonpause(data) {
      let boxid = data.detail
      this.triggerEvent('boxonpause', boxid)
    },
  },
})
