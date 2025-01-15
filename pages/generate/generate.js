const { generateWish } = require('../../utils/kimi.js')

Page({
  data: {
    keywords: '',
    bgId: null,
    wishText: '',
    generating: false,
    error: ''
  },

  onLoad(options) {
    if (options.keywords && options.bgId) {
      this.setData({
        keywords: options.keywords,
        bgId: parseInt(options.bgId)
      })
      this.generateWishText()
    }
  },

  async generateWishText() {
    this.setData({ 
      generating: true,
      error: ''
    })

    try {
      const wishText = await generateWish(this.data.keywords)
      this.setData({ 
        wishText,
        generating: false
      })
    } catch (err) {
      this.setData({
        generating: false,
        error: err.message || '生成失败，请重试'
      })
    }
  },

  regenerate() {
    this.generateWishText()
  },

  preview() {
    if (!this.data.wishText) return
    
    wx.navigateTo({
      url: `/pages/preview/preview?text=${encodeURIComponent(this.data.wishText)}&bgId=${this.data.bgId}`
    })
  }
})
