# Shopping Demo App - Angular 1.0

A simple shopping website demo built with Angular 1.0, Node.js, HTML, JavaScript, and CSS. This app intentionally uses Angular 1.0 to demonstrate code refactoring with AI.

## Features

- **Home Page**: Browse 3 featured products with a search bar at the top
- **Search Functionality**: Search for products by name or description
- **Product Pages**: View detailed product information including title, price, description, and add items to cart
- **Shopping Cart**: View cart items, adjust quantities, and see the total price

## Tech Stack

- **Frontend**: Angular 1.0, HTML, CSS, JavaScript
- **Backend**: Node.js with Express
- **Routing**: Angular routing for SPA experience

## Installation

1. Navigate to the example directory:
```bash
cd example_refactoring
```

2. Install dependencies:
```bash
npm install
```

3. Start the server:
```bash
npm start
```

4. Open your browser and navigate to:
```
http://localhost:12000
```

## Project Structure

```
openhands-demos/
└── example_refactoring/       # Shopping demo application
    ├── public/
    │   ├── css/
    │   │   └── style.css      # Styling for the shopping website
    │   ├── js/
    │   │   └── app.js         # Angular app with controllers and services
    │   ├── views/
    │   │   ├── home.html      # Home page template
    │   │   ├── search.html    # Search results template
    │   │   ├── product.html   # Product detail template
    │   │   └── cart.html      # Shopping cart template
    │   └── index.html         # Main HTML file
    ├── server.js              # Node.js Express server
    ├── package.json           # Project dependencies
    └── README.md              # This file
```

## How to Use

1. **Browse Products**: The home page displays 3 featured products
2. **Search**: Enter a search term in the search bar to find products
3. **View Product Details**: Click on any product to see full details
4. **Add to Cart**: Click "Add to Cart" on a product page to add items
5. **View Cart**: Click the cart icon in the header to see your cart
6. **Manage Cart**: Remove items or continue shopping from the cart page

## License

MIT
