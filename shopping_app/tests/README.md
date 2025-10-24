# Shopping Cart Integration Tests

This directory contains integration tests for the shopping cart functionality of the Shopping Demo App.

## Test Suite Overview

The integration tests use Puppeteer to simulate real user interactions with the application and verify that the shopping cart features work correctly.

## Tests Included

1. **Add Product to Cart** - Verifies that clicking "Add to Cart" on a product page successfully adds the item to the shopping cart and updates the cart count.

2. **Show Added Message** - Checks that the button text changes to "Added to Cart!" after adding a product, providing visual feedback to the user.

3. **Increment Quantity** - Tests that adding the same product multiple times increments the quantity rather than creating duplicate entries in the cart.

4. **Display Product Details** - Ensures that the correct product information (name, price) appears in the cart after adding items.

5. **Calculate Total** - Verifies that the cart correctly calculates the total price when multiple different products are added.

6. **Remove Product** - Tests that the remove button successfully deletes items from the cart.

7. **Empty Cart Message** - Confirms that an appropriate message is displayed when the cart is empty.

8. **Persist Cart Items** - Validates that cart items remain in the cart when navigating between different pages of the application.

## Running the Tests

### Prerequisites

Make sure you have Node.js and npm installed, and all dependencies are installed:

```bash
npm install
```

### Start the Server

The tests require the application server to be running on port 12000. Start it in a separate terminal:

```bash
npm start
```

### Run Tests

Run all integration tests:

```bash
npm test
```

Run tests in watch mode (re-runs tests on file changes):

```bash
npm run test:watch
```

Run tests with coverage report:

```bash
npm run test:coverage
```

## Test Configuration

The tests are configured in `package.json` with the following settings:

- Test environment: Node.js
- Test pattern: `**/tests/**/*.test.js`
- Test timeout: 30 seconds per test
- Verbose output: Enabled

## Technical Details

- Testing Framework: Jest
- Browser Automation: Puppeteer
- Browser Mode: Headless (runs without UI)
- Base URL: http://localhost:12000

The tests use Puppeteer to launch a headless Chrome browser and interact with the application just like a real user would - clicking buttons, navigating pages, and verifying the expected behavior.
