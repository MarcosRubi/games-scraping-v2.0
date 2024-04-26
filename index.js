const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false })

  const context = await browser.newContext({
    locale: 'en-US'
  }
  )

  const page = await context.newPage()

  await page.goto('https://www.gog.com/')

  await page.waitForSelector('.discover-games__products')

  const results = await page.evaluate(() => {
    const games = document.querySelectorAll('.discover-games__products .product-tile')

    const results = []

    for (const game of games) {
      const name = game.querySelector('.product-tile__title').textContent
      const imgUrl = game.querySelector('picture source').getAttribute('lazy-srcset').trim().split('\n')[0]

      const price = game.querySelectorAll('.product-tile__prices-inner span').length > 2
        ? [{ now: `$${game.querySelector('.product-tile__price-discounted').textContent.trim()}` }, { old: `$${game.querySelector('.product-tile__price').textContent}` }]
        : [{ now: `$${game.querySelector('.product-tile__price-discounted').textContent.trim()}` }]

      const discount = game.querySelector('.product-tile__discount') ? game.querySelector('.product-tile__discount').textContent : ''
      const url = `https://www.gog.com${game.querySelector('a').href}`

      results.push({ name, imgUrl, price, discount, url })
    }

    return results
  })

  console.log(results)

  await context.close()
  await browser.close()
})()
