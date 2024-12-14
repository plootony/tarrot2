import fetch from 'node-fetch'

export default async function handler(req, res) {
  console.log('🔄 API Request received:', new Date().toISOString())
  console.log('📍 Origin:', req.headers.origin)
  console.log('🛠 Method:', req.method)

  // Разрешаем запросы только с нашего домена
  const allowedOrigins = ['https://tarrot2.vercel.app', 'http://localhost:3000', 'http://localhost:5173']
  const origin = req.headers.origin
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin)
  }
  
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error('❌ X.AI API Error:', errorData)
      throw new Error(`API вернула ошибку: ${response.status}`)
    }

    const data = await response.json()
    
    if (!data || !data.choices || !data.choices[0]) {
      throw new Error('Некорректный формат ответа от API')
    }

    return res.status(200).json(data)
  } catch (error) {
    console.error('❌ Server Error:', error)
    return res.status(500).json({ 
      error: 'Произошла ошибка при получении предсказания',
      details: error.message 
    })
  }
} 