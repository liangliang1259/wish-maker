const app = getApp()

Page({
  data: {
    keywords: '',
    backgrounds: [],
    selectedBackground: null
  },

  onLoad() {
    this.setData({
      backgrounds: app.globalData.backgrounds,
      selectedBackground: app.globalData.backgrounds[0]
    })
  },

  onInput(e) {
    this.setData({
      keywords: e.detail.value
    })
  },

  selectBackground(e) {
    const id = parseInt(e.currentTarget.dataset.id)
    const background = this.data.backgrounds.find(bg => bg.id === id)
    this.setData({
      selectedBackground: background
    })
  },

  generateWish() {
    if (!this.data.keywords.trim()) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      })
      return
    }

    const params = {
      keywords: this.data.keywords,
      backgroundId: this.data.selectedBackground.id
    }
    
    // 使用 URL 参数传递数据
    wx.navigateTo({
      url: `/pages/generate/generate?keywords=${encodeURIComponent(params.keywords)}&backgroundId=${params.backgroundId}`
    })
  }
})
