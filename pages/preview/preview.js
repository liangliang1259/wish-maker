const app = getApp()

Page({
  data: {
    keywords: '',
    wishText: '',
    background: null,
    userInfo: null,
    hasUserInfo: false,
    showRedPackets: false,
    showFlash: false,
    isOpened: false,
    coins: [],
    fireworks: []
  },

  onLoad: function(options) {
    try {
      const { wishText, backgroundId, keywords } = options
      
      // 只在一个地方设置数据，确保正确解码
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

      // 触发闪光效果
      this.triggerFlash()
      
      // 开始烟花效果
      this.startFireworks();
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

  // 触发闪光效果
  triggerFlash() {
    this.setData({ showFlash: true })
    setTimeout(() => {
      this.setData({ showFlash: false })
    }, 1000)
  },

  // 触发红包雨效果
  triggerRedPackets() {
    this.setData({ showRedPackets: true })
    setTimeout(() => {
      this.setData({ showRedPackets: false })
    }, 3000)
  },

  openEnvelope() {
    if (this.data.isOpened) return;
    
    // 播放打开红包的音效
    const audio = wx.createInnerAudioContext();
    audio.src = '/assets/sounds/open.mp3';  // 需要添加音效文件
    audio.play();

    // 添加金币随机位置
    const coins = [];
    for (let i = 0; i < 8; i++) {
      const tx = Math.random() * 300 - 150; // 随机左右偏移
      coins.push({
        '--tx': tx + 'rpx'
      });
    }

    this.setData({
      isOpened: true,
      coins
    });

    // 震动反馈
    wx.vibrateShort();
  },

  startFireworks() {
    // 初始化烟花数组
    let fireworks = [];
    let fireworkId = 0;

    // 定时生成烟花
    const createFirework = () => {
      // 随机位置和大小
      const x = Math.random() * 80 + 10; // 10% - 90%
      const y = Math.random() * 40 + 30; // 30% - 70%
      const scale = Math.random() * 0.5 + 0.8; // 0.8 - 1.3

      // 添加新烟花
      fireworks.push({
        id: fireworkId++,
        x,
        y,
        scale
      });

      // 限制最大数量
      if (fireworks.length > 8) {
        fireworks.shift();
      }

      // 更新数据
      this.setData({ fireworks });

      // 移除已完成的烟花
      setTimeout(() => {
        fireworks = fireworks.filter(f => f.id !== fireworkId - 1);
        this.setData({ fireworks });
      }, 2300); // 总动画时间
    };

    // 随机间隔生成烟花
    const createRandomFirework = () => {
      createFirework();
      // 随机间隔 0.8-2 秒
      setTimeout(createRandomFirework, Math.random() * 1200 + 800);
    };

    // 开始时立即发射多个烟花
    for (let i = 0; i < 3; i++) {
      setTimeout(() => createFirework(), i * 300);
    }

    // 继续随机生成
    setTimeout(createRandomFirework, 2000);
  },

  onShareAppMessage() {
    console.log('触发分享事件，当前用户信息：', this.data.userInfo)
    
    // 触发红包雨和闪光效果
    this.triggerRedPackets()
    this.triggerFlash()
    
    const nickname = this.data.userInfo ? this.data.userInfo.nickName : '您的好友'
    console.log('使用的昵称：', nickname)
    
    return {
      title: `${nickname}给您送来新年祝福，点击查收`,
      path: `/pages/preview/preview?wishText=${encodeURIComponent(this.data.wishText)}&backgroundId=${this.data.background.id}&keywords=${encodeURIComponent(this.data.keywords)}`,
      imageUrl: this.data.background.url
    }
  }
})