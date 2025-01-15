App({
  globalData: {
    userInfo: null,
    backgrounds: [],
    apiKey: '', // OpenAI API Key
    apiEndpoint: 'https://api.openai.com/v1/completions'
  },
  onLaunch() {
    // 初始化背景图片
    this.loadBackgrounds()
  },
  
  loadBackgrounds() {
    // 这里将来会从服务器或本地加载背景图片
    this.globalData.backgrounds = Array(20).fill().map((_, i) => ({
      id: i + 1,
      url: `/images/backgrounds/bg${i + 1}.jpg`,
      name: `新年背景${i + 1}`
    }))
  }
})
