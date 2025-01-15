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

  onLoad() {
    const eventChannel = this.getOpenerEventChannel()
    eventChannel.on('acceptDataFromOpenerPage', (data) => {
      const { keywords, backgroundId } = data
      this.setData({ 
        keywords,
        background: app.globalData.backgrounds.find(bg => bg.id === backgroundId)
      })
      this.generateWish()
    })
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
    // 跳转到预览页面
    const params = {
      text: this.data.wishText,
      backgroundId: this.data.background.id
    }
    
    wx.navigateTo({
      url: '/pages/preview/preview',
      success: (res) => {
        res.eventChannel.emit('acceptDataFromOpenerPage', params)
      }
    })
  }
})
