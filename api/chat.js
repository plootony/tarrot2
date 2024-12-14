import fetch from 'node-fetch'

export default async function handler(req, res) {
  console.log('🚀 Serverless Function Started')
  console.log('📨 Request Method:', req.method)
  console.log('🔑 API Key present:', !!process.env.XAI_API_KEY)
  
  // Настраиваем CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    console.log('👍 OPTIONS request handled')
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    console.log('❌ Invalid method:', req.method)
    return res.status(405).json({ error: 'Метод не разрешен' })
  }

  try {
    // Добавляем таймаут для fetch
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 25000) // 25 секунд

    console.log('📡 Sending request to X.AI API...')
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify(req.body),
      signal: controller.signal
    }).finally(() => clearTimeout(timeout))

    console.log('📥 X.AI Response Status:', response.status)
    
    if (!response.ok) {
      const errorText = await response.text()
      console.error('❌ API Error Response:', errorText)
      return res.status(response.status).json({ 
        error: 'Ошибка API',
        details: errorText
      })
    }

    const data = await response.json()
    console.log('✅ Success Response Received')
    
    return res.status(200).json(data)
  } catch (error) {
    console.error('❌ Error Details:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    })

    // Специальная обработка ошибки таймаута
    if (error.name === 'AbortError') {
      return res.status(504).json({ 
        error: 'Превышено время ожидания ответа',
        details: 'Пожалуйста, попробуйте еще раз'
      })
    }

    return res.status(500).json({ 
      error: 'Произошла ошибка при получении предсказания',
      details: error.message
    })
  }
} 