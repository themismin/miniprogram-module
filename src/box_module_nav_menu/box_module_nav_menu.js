const app = getApp()
var timer = null

/**
 * 模块导航菜单组件
 * 用于显示各个功能模块的导航入口
 */
Component({
  properties: {
    /**
     * 模块导航菜单盒子数据
     * @property {Object} boxdata - 包含模块导航项和布局的对象
     */
    boxdata: {
      type: Object,
      /**
       * 观察boxdata属性变化并处理导航图片
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
  data: {},
  /**
   * 组件初始化完成后执行
   */
  ready: function () {},
  methods: {
    /**
     * 页面滚动事件处理
     * @param {Object} e - 滚动事件对象
     */
    onPageScroll(e) {},
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
     * 更新Tabbar状态，高亮当前页面对应的菜单项
     * @param {Object} newVal - 菜单数据
     */
    editTabbar: function (newVal) {
      let _tabbar = newVal
      let pages = getCurrentPages()
      if (pages.length > 0) {
        let currentPage = pages[pages.length - 1]
        let _pagePath = currentPage.route
        _pagePath.indexOf('/') != 0 && (_pagePath = '/' + _pagePath)
        let new_pagePath = ''
        if (_pagePath == '/pages/page/index') {
          new_pagePath = _pagePath + '?id=' + currentPage.options.id
        } else {
          new_pagePath = _pagePath
        }
        for (let i in _tabbar.module_contents) {
          _tabbar.module_contents[i].active = false
          if (_tabbar.module_contents[i].operation_attrs != null) {
            _tabbar.module_contents[i].operation_attrs.target_address == new_pagePath && (_tabbar.module_contents[i].active = true)
          }
        }
        currentPage.setData({
          tabBar: _tabbar,
        })
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
