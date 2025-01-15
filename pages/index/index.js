Page({
  data: {
    backgrounds: [],
    selectedBackground: null,
    keywords: ''
  },

  onLoad() {
    const app = getApp()
    this.setData({
      backgrounds: app.globalData.backgrounds
    })
  },

  onInput(e) {
    this.setData({
      keywords: e.detail.value
    })
  },

  selectBackground(e) {
    const { id } = e.currentTarget.dataset
    this.setData({
      selectedBackground: this.data.backgrounds.find(bg => bg.id === id)
    })
  },

  generateWish() {
    if (!this.data.keywords) {
      wx.showToast({
        title: '请输入关键词',
        icon: 'none'
      })
      return
    }
    
    if (!this.data.selectedBackground) {
      wx.showToast({
        title: '请选择背景图',
        icon: 'none'
      })
      return
    }

    wx.navigateTo({
      url: `/pages/generate/generate?keywords=${this.data.keywords}&bgId=${this.data.selectedBackground.id}`
    })
  }
})
