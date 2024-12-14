import express from 'express'
import fetch from 'node-fetch'
import dotenv from 'dotenv'
import cors from 'cors'

dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

app.post('/chat', async (req, res) => {
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
    res.json(data)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ 
      error: 'Произошла ошибка при получении предсказания' 
    })
  }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
}) 