App({
  globalData: {
    userInfo: null,
    backgrounds: [],
    apiKey: '', // OpenAI API Key
    apiEndpoint: 'https://api.moonshot.cn/v1/completions'
  },
  onLaunch() {
    // 初始化云开发环境
    wx.cloud.init({
      env: 'prod-0gbxqfk6a2f9c9c9',  // 云开发环境ID
      traceUser: true
    })
    // 初始化背景图片
    this.loadBackgrounds()
  },
  
  loadBackgrounds() {
    this.globalData.backgrounds = [
      {
        id: 1,
        name: '烟花',
        url: 'https://www.helloimg.com/i/2025/01/16/678870e368709.jpg',
        textColor: '#FFFFFF',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      },
      {
        id: 2,
        name: '灯笼',
        url: 'https://www.helloimg.com/i/2025/01/16/678870e3942e5.jpg',
        textColor: '#FFD700',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      },
      {
        id: 3,
        name: '舞龙',
        url: 'https://img.freepik.com/free-photo/dragon-dance-chinese-new-year_1417-1789.jpg',
        textColor: '#FFFFFF',
        textShadow: '0 2px 4px rgba(0,0,0,0.5)'
      }
    ]
  }
})
