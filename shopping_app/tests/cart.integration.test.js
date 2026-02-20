const puppeteer = require('puppeteer');

const BASE_URL = 'http://localhost:12000';
let browser;
let page;

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

describe('Shopping Cart Integration Tests', () => {
  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
  });

  afterAll(async () => {
    await browser.close();
  });

  beforeEach(async () => {
    page = await browser.newPage();
    await page.goto(BASE_URL, { waitUntil: 'networkidle0' });
  });

  afterEach(async () => {
    await page.close();
  });

  test('should add a product to cart from product page', async () => {
    await page.waitForSelector('.product-card');
    
    const productCards = await page.$$('.product-card');
    expect(productCards.length).toBeGreaterThan(0);
    
    await productCards[0].click();
    await page.waitForSelector('.product-detail');
    
    const cartCountBefore = await page.evaluate(() => {
      const cartIcon = document.querySelector('.cart-icon');
      const match = cartIcon.textContent.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });
    
    await page.click('.add-to-cart-btn');
    
    await page.waitForFunction(
      (prevCount) => {
        const cartIcon = document.querySelector('.cart-icon');
        const match = cartIcon.textContent.match(/\d+/);
        const currentCount = match ? parseInt(match[0]) : 0;
        return currentCount > prevCount;
      },
      { timeout: 5000 },
      cartCountBefore
    );
    
    const cartCountAfter = await page.evaluate(() => {
      const cartIcon = document.querySelector('.cart-icon');
      const match = cartIcon.textContent.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });
    
    expect(cartCountAfter).toBe(cartCountBefore + 1);
  });

  test('should show added message after adding product to cart', async () => {
    await page.waitForSelector('.product-card');
    
    const productCards = await page.$$('.product-card');
    await productCards[0].click();
    await page.waitForSelector('.product-detail');
    
    await page.click('.add-to-cart-btn');
    
    await wait(100);
    
    const buttonText = await page.evaluate(() => {
      return document.querySelector('.add-to-cart-btn').textContent;
    });
    
    expect(buttonText).toContain('Added to Cart');
  });

  test('should increment quantity when adding same product multiple times', async () => {
    await page.waitForSelector('.product-card');
    
    const productCards = await page.$$('.product-card');
    await productCards[0].click();
    await page.waitForSelector('.product-detail');
    
    await page.click('.add-to-cart-btn');
    await wait(2500);
    
    await page.click('.add-to-cart-btn');
    await wait(500);
    
    await page.click('.cart-icon');
    await page.waitForSelector('.cart-item');
    
    const cartItems = await page.$$('.cart-item');
    expect(cartItems.length).toBe(1);
    
    const quantity = await page.evaluate(() => {
      const item = document.querySelector('.cart-item');
      const quantityText = item.querySelector('.item-price').textContent;
      return parseInt(quantityText.match(/x (\d+)/)[1]);
    });
    
    expect(quantity).toBe(2);
  });

  test('should display correct product details in cart', async () => {
    await page.waitForSelector('.product-card');
    
    const productName = await page.evaluate(() => {
      return document.querySelector('.product-card h4').textContent;
    });
    
    const productCards = await page.$$('.product-card');
    await productCards[0].click();
    await page.waitForSelector('.product-detail');
    
    await page.click('.add-to-cart-btn');
    await wait(500);
    
    await page.click('.cart-icon');
    await page.waitForSelector('.cart-item');
    
    const cartProductName = await page.evaluate(() => {
      return document.querySelector('.cart-item h4').textContent;
    });
    
    expect(cartProductName).toBe(productName);
  });

  test('should calculate correct total for multiple products', async () => {
    await page.waitForSelector('.product-card');
    
    const productCards = await page.$$('.product-card');
    
    await productCards[0].click();
    await page.waitForSelector('.product-detail');
    const price1 = await page.evaluate(() => {
      const priceText = document.querySelector('.price-large').textContent;
      return parseFloat(priceText.replace(/[^0-9.]/g, ''));
    });
    await page.click('.add-to-cart-btn');
    await wait(500);
    
    await page.goBack();
    await page.waitForSelector('.product-card');
    
    const productCardsAgain = await page.$$('.product-card');
    await productCardsAgain[1].click();
    await page.waitForSelector('.product-detail');
    const price2 = await page.evaluate(() => {
      const priceText = document.querySelector('.price-large').textContent;
      return parseFloat(priceText.replace(/[^0-9.]/g, ''));
    });
    await page.click('.add-to-cart-btn');
    await wait(500);
    
    await page.click('.cart-icon');
    await page.waitForSelector('.total');
    
    const displayedTotal = await page.evaluate(() => {
      const totalText = document.querySelector('.total').textContent;
      return parseFloat(totalText.replace(/[^0-9.]/g, ''));
    });
    
    const expectedTotal = price1 + price2;
    expect(displayedTotal).toBeCloseTo(expectedTotal, 2);
  });

  test('should remove product from cart', async () => {
    await page.waitForSelector('.product-card');
    
    const productCards = await page.$$('.product-card');
    await productCards[0].click();
    await page.waitForSelector('.product-detail');
    
    await page.click('.add-to-cart-btn');
    await wait(500);
    
    await page.click('.cart-icon');
    await page.waitForSelector('.cart-item');
    
    const itemCountBefore = await page.$$eval('.cart-item', items => items.length);
    expect(itemCountBefore).toBe(1);
    
    await page.click('.remove-btn');
    await wait(500);
    
    const itemCountAfter = await page.$$eval('.cart-item', items => items.length);
    expect(itemCountAfter).toBe(0);
  });

  test('should show empty cart message when cart is empty', async () => {
    await page.click('.cart-icon');
    await page.waitForSelector('.cart-page');
    
    const emptyMessage = await page.evaluate(() => {
      const message = document.querySelector('.empty-cart');
      return message ? message.textContent : '';
    });
    
    expect(emptyMessage).toContain('empty');
  });

  test('should persist cart items when navigating between pages', async () => {
    await page.waitForSelector('.product-card');
    
    const productCards = await page.$$('.product-card');
    await productCards[0].click();
    await page.waitForSelector('.product-detail');
    
    await page.click('.add-to-cart-btn');
    await wait(500);
    
    await page.goBack();
    await page.waitForSelector('.product-card');
    
    const cartCount = await page.evaluate(() => {
      const cartIcon = document.querySelector('.cart-icon');
      const match = cartIcon.textContent.match(/\d+/);
      return match ? parseInt(match[0]) : 0;
    });
    
    expect(cartCount).toBe(1);
  });
});
