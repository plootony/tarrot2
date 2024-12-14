import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()
console.log('🔑 API Key present:', !!process.env.XAI_API_KEY)

const app = express()
app.use(cors())
app.use(express.json())

app.post('/chat', async (req, res) => {
  console.log('📨 Received request:', {
    method: req.method,
    headers: req.headers,
    body: req.body
  })

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
    res.json(data)
  } catch (error) {
    console.error('❌ Error Details:', {
      message: error.message,
      stack: error.stack
    })
    res.status(500).json({ 
      error: 'Произошла ошибка при получении предсказания',
      details: error.message
    })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`)
}) 