import fetch from 'node-fetch'

export default async function handler(req, res) {
  console.log('🚀 Serverless Function Started')
  console.log('📨 Request Method:', req.method)
  console.log('🔑 API Key present:', !!process.env.XAI_API_KEY)
  console.log('📦 Request Body:', JSON.stringify(req.body, null, 2))

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
    console.log('📡 Sending request to X.AI API...')
    const response = await fetch('https://api.x.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.XAI_API_KEY}`
      },
      body: JSON.stringify(req.body)
    })

    console.log('📥 X.AI Response Status:', response.status)
    const responseText = await response.text()
    console.log('📄 Raw Response:', responseText)

    if (!response.ok) {
      console.error('❌ API Error Response:', responseText)
      throw new Error(`API Error: ${response.status} - ${responseText}`)
    }

    let data
    try {
      data = JSON.parse(responseText)
    } catch (e) {
      console.error('❌ JSON Parse Error:', e)
      throw new Error(`Invalid JSON response: ${responseText}`)
    }

    console.log('✅ Success Response:', JSON.stringify(data, null, 2))
    return res.status(200).json(data)
  } catch (error) {
    console.error('❌ Error Details:', {
      message: error.message,
      stack: error.stack
    })
    return res.status(500).json({ 
      error: 'Произошла ошибка при получении предсказания',
      details: error.message
    })
  }
} 