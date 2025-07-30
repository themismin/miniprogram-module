const app = getApp()
const phoneAuth = require('../../../utils/common')

/**
 * 弹窗广告组件
 * 用于显示弹窗广告，支持获取手机号和关闭功能
 */
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    /**
     * 弹窗盒子数据
     * @property {Object} boxdata - 包含弹窗内容和样式的对象
     */
    boxdata: {
      type: Object,
      /**
       * 观察boxdata属性变化并处理弹窗图片
       * @param {Object} newVal - 新的boxdata值
       * @param {Object} oldVal - 旧的boxdata值
       * @param {string} changedPath - 变化的属性路径
       */
      observer: function (newVal, oldVal, changedPath) {
        let that = this
        newVal.module_contents.forEach((item, index) => {
          newVal.module_contents[index].content = app.cropimg(item.content, newVal.inside_style_attrs.width, newVal.inside_style_attrs.height, 'crop', 1.5)
        })
        that.setData({
          box: newVal,
          snsapi_phonenumber: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber(),
          user_info: wx.common.AuthorizationUserInfo.getUserInfoMessage(),
        })
      },
    },
    /**
     * 盒子类型
     * @property {String} boxtype - 组件类型标识
     */
    boxtype: {
      type: String,
      observer: function (newVal, oldVal, changedPath) {},
    },
    /**
     * 盒子唯一标识
     * @property {Number} boxid - 组件的唯一ID
     */
    boxid: {
      type: Number,
      observer: function (newVal, oldVal, changedPath) {},
    },
  },

  /**
   * 组件的初始数据
   */
  data: {
    showScreenMask: true,
  },

  /**
   * 组件的方法列表
   */
  methods: {
    /**
     * 关闭弹窗
     * 隐藏弹窗蒙版
     */
    close() {
      let that = this
      that.setData({
        showScreenMask: false,
      })
    },
    /**
     * 提交用户申请
     * 发送用户信息到服务器并关闭弹窗
     */
    apply() {
      let that = this
      app.request({
        url: wx.path.APPLYSUBMIT,
        method: 'post',
        data: {
          type: 'POPUP_AUTH',
          model_type: that.data.boxtype,
          model_id: that.data.boxid,
          phone_number: that.data.user_info.phone_number,
          user_name: that.data.user_info.nickname,
        },
        success: (res) => {
          if (res.data.code == 200) {
            that.setData({
              showScreenMask: false,
            })
          }
        },
      })
    },
    /**
     * 获取用户手机号
     * 处理微信手机号授权回调
     * @param {Object} e - 微信授权事件对象
     */
    getPhoneNumber(e) {
      let that = this
      phoneAuth.AuthorizationPhone.getPhoneNumber(e, {
        success: () => {
          that.setData({
            snsapi_phonenumber: wx.common.AuthorizationUserInfo.getsnsapi_phonenumber(),
            user_info: wx.common.AuthorizationUserInfo.getUserInfoMessage(),
            showScreenMask: false,
          })
        },
      })
    },
  },
})
