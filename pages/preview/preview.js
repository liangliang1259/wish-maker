const app = getApp()

Page({
  data: {
    keywords: '',
    wishText: '',
    background: null,
    showRedPacket: false,
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

  // 格式化祝福语文本，确保每行不超过15个字符
  formatWishText(text) {
    if (!text) return ''
    
    const maxCharsPerLine = 15
    const result = []
    let currentLine = ''
    
    // 首先按标点符号分割
    const segments = text.split(/([，。！；：、？])/g)
    
    for (let i = 0; i < segments.length; i++) {
      let segment = segments[i]
      
      // 如果是标点符号，直接添加到当前行
      if (/[，。！；：、？]/.test(segment)) {
        currentLine += segment
        result.push(currentLine)
        currentLine = ''
        continue
      }
      
      // 处理非标点符号的文本段
      while (segment.length > 0) {
        // 当前行还可以添加更多字符
        if (currentLine.length + segment.length <= maxCharsPerLine) {
          currentLine += segment
          break
        }
        // 当前行已满，需要换行
        else {
          const remainingSpace = maxCharsPerLine - currentLine.length
          if (remainingSpace > 0) {
            currentLine += segment.substring(0, remainingSpace)
            segment = segment.substring(remainingSpace)
          }
          result.push(currentLine)
          currentLine = ''
        }
      }
    }
    
    // 添加最后一行
    if (currentLine) {
      result.push(currentLine)
    }
    
    return result.join('\n')
  },

  async saveImage() {
    wx.showLoading({
      title: '保存中...',
    })

    try {
      // 获取整个预览卡片的节点信息
      const query = wx.createSelectorQuery()
      const cardNode = await new Promise((resolve, reject) => {
        query.select('.preview-container')
          .fields({ node: true, size: true })
          .exec((res) => {
            if (res[0]) {
              resolve(res[0])
            } else {
              reject(new Error('获取节点失败'))
            }
          })
      })

      // 创建画布
      const canvas = wx.createOffscreenCanvas({
        type: '2d',
        width: cardNode.width,
        height: cardNode.height
      })
      const ctx = canvas.getContext('2d')

      // 绘制背景
      ctx.fillStyle = '#ff2d2d'
      ctx.fillRect(0, 0, cardNode.width, cardNode.height)

      // 绘制文字
      ctx.fillStyle = '#fff'
      ctx.font = '24px Arial'
      ctx.textAlign = 'center'
      const textLines = this.data.wishText.split('\n')
      const lineHeight = 40
      for (let i = 0; i < textLines.length; i++) {
        const text = textLines[i]
        const x = cardNode.width / 2
        const y = 120 + i * lineHeight
        ctx.fillText(text, x, y)
      }

      // 导出图片
      const tempFilePath = `${wx.env.USER_DATA_PATH}/wish_${Date.now()}.png`
      const fs = wx.getFileSystemManager()
      const buffer = canvas.toBufferSync()
      fs.writeFileSync(tempFilePath, buffer, 'binary')

      // 保存到相册
      await wx.saveImageToPhotosAlbum({
        filePath: tempFilePath
      })

      wx.showToast({
        title: '保存成功',
        icon: 'success'
      })
    } catch (error) {
      console.error('Save image error:', error)
      wx.showToast({
        title: '保存失败',
        icon: 'none'
      })
    } finally {
      wx.hideLoading()
    }
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

  handleShare() {
    console.log('点击分享按钮');
    if (!this.data.hasUserInfo) {
      this.getUserProfile();
    }
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
  },

  showRedPacketAnimation() {
    this.setData({ showRedPacket: true })
    setTimeout(() => {
      this.setData({ showRedPacket: false })
    }, 3000)
  }
})