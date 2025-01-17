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
    
    // 按标点符号分割文本
    const segments = text.split(/([，。！；：、？,.!;:?])/g)
    const result = []
    let currentLine = ''
    
    for (let i = 0; i < segments.length; i++) {
      const segment = segments[i]
      if (!segment) continue
      
      // 如果是标点符号，添加到当前行并换行
      if (/[，。！；：、？,.!;:?]/.test(segment)) {
        currentLine += segment
        if (currentLine) {
          result.push(currentLine)
          currentLine = ''
        }
        continue
      }
      
      // 如果当前行加上新片段超过20个字符，先保存当前行
      if (currentLine.length + segment.length > 20) {
        if (currentLine) {
          result.push(currentLine)
        }
        // 如果单个片段超过20个字符，需要强制分行
        if (segment.length > 20) {
          let temp = segment
          while (temp.length > 20) {
            result.push(temp.substring(0, 20))
            temp = temp.substring(20)
          }
          currentLine = temp
        } else {
          currentLine = segment
        }
      } else {
        currentLine += segment
      }
    }
    
    // 添加最后一行
    if (currentLine) {
      result.push(currentLine)
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