// pages/preview/preview.js
const app = getApp()

Page({
  data: {
    wishText: '',
    background: null
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    try {
      const { wishText, backgroundId } = options
      if (!wishText || !backgroundId) {
        throw new Error('缺少必要参数')
      }

      this.setData({
        wishText: decodeURIComponent(wishText),
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

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 保存图片
   */
  async saveImage() {
    wx.showLoading({
      title: '保存中...',
    })

    try {
      // 获取预览卡片的节点信息
      const query = wx.createSelectorQuery()
      const cardNode = await new Promise((resolve, reject) => {
        query.select('.preview-card')
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

      // 绘制文字
      ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'
      ctx.fillRect(cardNode.width * 0.1, cardNode.height * 0.4, cardNode.width * 0.8, cardNode.height * 0.2)
      ctx.font = '16px sans-serif'
      ctx.fillStyle = '#ffffff'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillText(this.data.wishText, cardNode.width / 2, cardNode.height / 2)

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

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {
    return {
      title: '送你一份新年祝福',
      path: `/pages/preview/preview?wishText=${encodeURIComponent(this.data.wishText)}&backgroundId=${this.data.background.id}`,
      imageUrl: this.data.background.url
    }
  }
})