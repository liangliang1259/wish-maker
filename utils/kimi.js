const KIMI_API_ENDPOINT = 'https://api.moonshot.cn/v1/chat/completions'

function generateWish(keywords) {
  return new Promise((resolve, reject) => {
    const prompt = `请根据关键词"${keywords}"生成一段新年祝福语，要求：
    1. 字数在50-100字之间
    2. 语言要温暖有趣
    3. 要符合中国传统文化
    4. 要结合当前2024年春节的时代特点
    请直接返回祝福语内容，不要加任何其他说明。`

    wx.request({
      url: KIMI_API_ENDPOINT,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${wx.getStorageSync('kimiApiKey')}`
      },
      data: {
        model: 'moonshot-v1-8k',
        messages: [{
          role: 'user',
          content: prompt
        }],
        temperature: 0.7,
        max_tokens: 200
      },
      success(res) {
        if (res.data && res.data.choices && res.data.choices[0]) {
          resolve(res.data.choices[0].message.content.trim())
        } else {
          reject(new Error('生成失败，请重试'))
        }
      },
      fail(err) {
        reject(err)
      }
    })
  })
}
