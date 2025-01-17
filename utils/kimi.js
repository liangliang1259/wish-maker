const KIMI_API_ENDPOINT = 'https://api.moonshot.cn/v1/chat/completions'
const KIMI_API_KEY = 'sk-Nbj0hq8vd2QbsfqnGocp2OurXTmRGu8uWCHVbJh8TTypV23b'

const generateWish = function(keywords) {
  return new Promise((resolve, reject) => {
    const prompt = `请根据关键词"${keywords}"生成一段新年祝福语，关键词是人名，要求：
    1. 生成的内容中不要放入关键词
    2. 字数在50-100字之间
    3. 语言要温暖有趣
    4. 要符合中国传统文化
    5. 要结合当前2025年春节的时代特点
    请直接返回祝福语内容，不要加任何其他说明。`

    wx.request({
      url: KIMI_API_ENDPOINT,
      method: 'POST',
      header: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${KIMI_API_KEY}`
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

module.exports = {
  generateWish: generateWish
}
