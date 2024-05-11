const { chromium } = require('playwright')
const express = require('express')

const app = express()
const port = 3000

// Definir el endpoint GET /getGogGames
app.get('/getGogGames', async (req, res) => {
  try {
    const browser = await chromium.launch({ headless: true }) // Usar headless true para evitar problemas de visualización
    const context = await browser.newContext({ locale: 'en-US' }) // Establecer locale en-US para asegurar idioma inglés
    const page = await context.newPage()

    await page.goto('https://www.gog.com/', { waitUntil: 'domcontentloaded' })
    await page.waitForSelector('.discover-games__products')

    // Usar page.$$eval para obtener datos de los juegos de forma segura
    const results = await page.$$eval('.discover-games__products .product-tile', (games) => {
      return games.map((game) => {
        const name = game.querySelector('.product-tile__title').textContent.trim()
        const imgUrl = game.querySelector('img').getAttribute('src').trim()
        const priceElement = game.querySelector('.product-tile__price-discounted')
        const priceNow = priceElement ? `$${priceElement.textContent.trim()}` : ''
        const discountElement = game.querySelector('.product-tile__discount')
        const discount = discountElement ? discountElement.textContent.trim() : ''
        const url = game.querySelector('a').href

        return { name, imgUrl, price: priceNow, discount, url }
      })
    })

    await browser.close()

    res.json(results)
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Internal Server Error' })
  }
})

// Iniciar el servidor Express
app.listen(port, () => {
  console.log(`Server running on port ${port}`)
})
