const app = getApp()

Page({
  data: {
    keywords: '',
    wishText: '',
    background: null,
    userInfo: null,
    hasUserInfo: false
  },

  onLoad: function(options) {
    try {
      const { wishText, backgroundId, keywords } = options
      
      this.setData({
        keywords: decodeURIComponent(keywords || ''),
        wishText: this.formatWishText(decodeURIComponent(wishText || '')),
        background: app.globalData.backgrounds.find(bg => bg.id === parseInt(backgroundId))
      })

      // 检查是否已经有用户信息
      const userInfo = wx.getStorageSync('userInfo')
      if (userInfo && userInfo.nickName) {
        this.setData({
          userInfo: userInfo,
          hasUserInfo: true
        })
      }
    } catch (error) {
      console.error('Preview page load error:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  formatWishText(text) {
    if (!text) return ''
    const maxChars = 15
    const result = []
    let line = ''
    
    for (const char of text) {
      if (line.length >= maxChars) {
        result.push(line)
        line = char
      } else {
        line += char
      }
    }
    
    if (line) {
      result.push(line)
    }
    
    return result.join('\n')
  },

  getUserProfile(e) {
    // 使用手机号登录后获取用户信息
    wx.login({
      success: (loginRes) => {
        if (loginRes.code) {
          // 这里模拟获取用户信息
          const userInfo = {
            nickName: '新年好运'
          }
          console.log('获取用户信息成功：', userInfo)
          this.setData({
            userInfo: userInfo,
            hasUserInfo: true
          })
          wx.setStorageSync('userInfo', userInfo)
          wx.showToast({
            title: '授权成功',
            icon: 'success'
          })
        }
      }
    })
  },

  onShareAppMessage() {
    console.log('触发分享事件，当前用户信息：', this.data.userInfo)
    this.showRedPacketAnimation()
    
    const nickname = this.data.userInfo ? this.data.userInfo.nickName : '您的好友'
    console.log('使用的昵称：', nickname)
    
    return {
      title: `${nickname}给您送来新年祝福，点击查收`,
      path: `/pages/preview/preview?wishText=${encodeURIComponent(this.data.wishText)}&backgroundId=${this.data.background.id}&keywords=${encodeURIComponent(this.data.keywords)}`,
      imageUrl: this.data.background.url
    }
  }
})