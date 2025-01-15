const app = getApp()
const kimi = require('../../utils/kimi.js')

Page({
  data: {
    keywords: '',
    wishText: '',
    generating: false,
    error: null,
    background: null
  },

  onLoad(options) {
    try {
      const { keywords, backgroundId } = options || {}
      if (!keywords || !backgroundId) {
        throw new Error('缺少必要参数')
      }

      this.setData({ 
        keywords: decodeURIComponent(keywords),
        background: app.globalData.backgrounds.find(bg => bg.id === parseInt(backgroundId))
      })
      
      this.generateWish()
    } catch (error) {
      console.error('Page load error:', error)
      wx.showToast({
        title: '页面加载错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  async generateWish() {
    if (this.data.generating) return
    
    this.setData({
      generating: true,
      error: null
    })

    try {
      const wishText = await kimi.generateWish(this.data.keywords)
      this.setData({
        wishText,
        generating: false
      })
    } catch (error) {
      console.error('Generate wish error:', error)
      this.setData({
        error: '生成祝福语时出错，请重试',
        generating: false
      })
    }
  },

  regenerate() {
    this.generateWish()
  },

  preview() {
    wx.navigateTo({
      url: `/pages/preview/preview?wishText=${encodeURIComponent(this.data.wishText)}&backgroundId=${this.data.background.id}`
    })
  }
})
