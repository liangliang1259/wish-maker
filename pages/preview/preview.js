const app = getApp()

Page({
  data: {
    wishText: '',
    keywords: '',
    background: null,
    qrCodeUrl: '/images/qrcode-placeholder.png', // 使用占位图片替代二维码
    showRedPacket: false
  },

  onLoad(options) {
    try {
      const { wishText, backgroundId, keywords } = options
      if (!wishText || !backgroundId) {
        throw new Error('缺少必要参数')
      }

      this.setData({
        wishText: decodeURIComponent(wishText),
        keywords: decodeURIComponent(keywords),
        background: app.globalData.backgrounds.find(bg => bg.id === parseInt(backgroundId))
      })
    } catch (error) {
      console.error('Preview page load error:', error)
      wx.showToast({
        title: '页面加载错误',
        icon: 'none'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
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
      const bgImage = canvas.createImage()
      await new Promise((resolve, reject) => {
        bgImage.onload = resolve
        bgImage.onerror = reject
        bgImage.src = this.data.background.url
      })
      ctx.drawImage(bgImage, 0, 0, cardNode.width, cardNode.height)

      // 绘制内容
      ctx.font = '48px STKaiti'
      ctx.fillStyle = '#FFD700'
      ctx.textAlign = 'center'
      ctx.fillText(this.data.keywords, cardNode.width / 2, 120)

      ctx.font = '36px STXingkai'
      ctx.fillStyle = '#333'
      const wishLines = this.getTextLines(ctx, this.data.wishText, cardNode.width * 0.8)
      let y = cardNode.height / 2
      wishLines.forEach(line => {
        ctx.fillText(line, cardNode.width / 2, y)
        y += 50
      })

      // 绘制二维码占位图
      const qrImage = canvas.createImage()
      await new Promise((resolve, reject) => {
        qrImage.onload = resolve
        qrImage.onerror = reject
        qrImage.src = this.data.qrCodeUrl
      })
      const qrSize = 200
      const qrX = (cardNode.width - qrSize) / 2
      const qrY = cardNode.height - qrSize - 100
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize)

      // 导出图片
      const tempFilePath = `${wx.env.USER_DATA_PATH}/wish_${Date.now()}.png`
      const fs = wx.getFileSystemManager()
      fs.writeFileSync(tempFilePath, canvas.toDataURL().slice(22), 'base64')

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

  getTextLines(ctx, text, maxWidth) {
    const lines = []
    let line = ''
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i]
      const testLine = line + char
      const metrics = ctx.measureText(testLine)
      
      if (metrics.width > maxWidth && line.length > 0) {
        lines.push(line)
        line = char
      } else {
        line = testLine
      }
    }
    
    if (line.length > 0) {
      lines.push(line)
    }
    
    return lines
  },

  onShareAppMessage() {
    this.showRedPacketAnimation()
    return {
      title: `${this.data.keywords}给您送来新年祝福`,
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