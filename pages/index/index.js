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

    // 使用 wx.navigateTo 的 success 回调来传递完整的数据
    const params = {
      keywords: this.data.keywords,
      backgroundId: this.data.selectedBackground.id
    }
    
    wx.navigateTo({
      url: '/pages/generate/generate',
      success: (res) => {
        res.eventChannel.emit('acceptDataFromOpenerPage', params)
      }
    })
  }
})
