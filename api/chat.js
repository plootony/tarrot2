import fetch from 'node-fetch'

export default async function handler(req, res) {
  // Настраиваем CORS
  res.setHeader('Access-Control-Allow-Credentials', true)
  res.setHeader('Access-Control-Allow-Origin', '*')
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
    return res.status(405).json({ error: 'Метод не разрешен' })
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
      const error = await response.json()
      throw new Error(error.message || 'API Error')
    }

    const data = await response.json()
    return res.status(200).json(data)
  } catch (error) {
    console.error('Error:', error)
    return res.status(500).json({ 
      error: 'Произошла ошибка при получении предсказания' 
    })
  }
} 