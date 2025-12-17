var app = angular.module('shoppingApp', ['ngRoute']);

app.config(function($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'views/home.html',
      controller: 'HomeController'
    })
    .when('/search', {
      templateUrl: 'views/search.html',
      controller: 'SearchController'
    })
    .when('/product/:id', {
      templateUrl: 'views/product.html',
      controller: 'ProductController'
    })
    .when('/cart', {
      templateUrl: 'views/cart.html',
      controller: 'CartController'
    })
    .when('/pricing', {
      templateUrl: 'views/pricing.html',
      controller: 'PricingController'
    })
    .otherwise({
      redirectTo: '/'
    });
});

app.factory('ProductService', function() {
  var products = [
    {
      id: 1,
      name: 'Wireless Headphones',
      price: 79.99,
      description: 'High-quality wireless headphones with noise cancellation and 30-hour battery life. Perfect for music lovers and commuters.',
      image: '🎧'
    },
    {
      id: 2,
      name: 'Smart Watch',
      price: 199.99,
      description: 'Stay connected with this feature-packed smartwatch. Track your fitness, receive notifications, and monitor your health.',
      image: '⌚'
    },
    {
      id: 3,
      name: 'Bluetooth Speaker',
      price: 49.99,
      description: 'Portable Bluetooth speaker with amazing sound quality and 12-hour battery. Waterproof design for outdoor adventures.',
      image: '🔊'
    }
  ];

  return {
    getAllProducts: function() {
      return products;
    },
    getProductById: function(id) {
      for (var i = 0; i < products.length; i++) {
        if (products[i].id == id) {
          return products[i];
        }
      }
      return null;
    },
    searchProducts: function(query) {
      if (!query) return products;
      var lowerQuery = query.toLowerCase();
      return products.filter(function(p) {
        return p.name.toLowerCase().indexOf(lowerQuery) !== -1 ||
               p.description.toLowerCase().indexOf(lowerQuery) !== -1;
      });
    }
  };
});

app.factory('CartService', function() {
  var cart = [];

  return {
    getCart: function() {
      return cart;
    },
    addToCart: function(product) {
      var existingItem = null;
      for (var i = 0; i < cart.length; i++) {
        if (cart[i].product.id === product.id) {
          existingItem = cart[i];
          break;
        }
      }
      
      if (existingItem) {
        existingItem.quantity++;
      } else {
        cart.push({ product: product, quantity: 1 });
      }
    },
    removeFromCart: function(index) {
      cart.splice(index, 1);
    },
    getTotal: function() {
      var total = 0;
      for (var i = 0; i < cart.length; i++) {
        total += cart[i].product.price * cart[i].quantity;
      }
      return total;
    }
  };
});

app.controller('MainController', function($scope, $location, CartService) {
  $scope.cart = CartService.getCart();
  
  $scope.goToCart = function() {
    $location.path('/cart');
  };
});

app.controller('HomeController', function($scope, $location, ProductService, CartService) {
  $scope.products = ProductService.getAllProducts();
  $scope.searchQuery = '';

  $scope.search = function() {
    if ($scope.searchQuery) {
      $location.path('/search').search({ q: $scope.searchQuery });
    }
  };

  $scope.goToProduct = function(id) {
    $location.path('/product/' + id);
  };
});

app.controller('SearchController', function($scope, $location, $routeParams, ProductService) {
  $scope.searchQuery = $location.search().q || '';
  $scope.results = ProductService.searchProducts($scope.searchQuery);

  $scope.search = function() {
    if ($scope.searchQuery) {
      $location.path('/search').search({ q: $scope.searchQuery });
      $scope.results = ProductService.searchProducts($scope.searchQuery);
    }
  };

  $scope.goToProduct = function(id) {
    $location.path('/product/' + id);
  };
});

app.controller('ProductController', function($scope, $routeParams, $location, ProductService, CartService) {
  var productId = parseInt($routeParams.id);
  $scope.product = ProductService.getProductById(productId);
  
  if (!$scope.product) {
    $location.path('/');
    return;
  }

  $scope.added = false;

  $scope.addToCart = function() {
    CartService.addToCart($scope.product);
    $scope.added = true;
    setTimeout(function() {
      $scope.$apply(function() {
        $scope.added = false;
      });
    }, 2000);
  };

  $scope.goBack = function() {
    window.history.back();
  };
});

app.controller('CartController', function($scope, $location, CartService) {
  $scope.cartItems = CartService.getCart();

  $scope.removeItem = function(index) {
    CartService.removeFromCart(index);
  };

  $scope.getTotal = function() {
    return CartService.getTotal();
  };

  $scope.goToProduct = function(id) {
    $location.path('/product/' + id);
  };

  $scope.continueShopping = function() {
    $location.path('/');
  };
});

app.controller('PricingController', function($scope, $location) {
  $scope.pricingPlans = [
    {
      name: 'Basic',
      price: 9.99,
      period: 'month',
      description: 'Perfect for casual shoppers',
      buttonText: 'Get Started',
      featured: false,
      features: [
        { name: 'Up to 10 orders per month', included: true },
        { name: 'Basic customer support', included: true },
        { name: 'Standard shipping', included: true },
        { name: 'Order tracking', included: true },
        { name: 'Priority support', included: false },
        { name: 'Express shipping', included: false },
        { name: 'Advanced analytics', included: false }
      ]
    },
    {
      name: 'Pro',
      price: 19.99,
      period: 'month',
      description: 'Great for regular shoppers',
      buttonText: 'Choose Pro',
      featured: true,
      features: [
        { name: 'Unlimited orders', included: true },
        { name: 'Priority customer support', included: true },
        { name: 'Free express shipping', included: true },
        { name: 'Advanced order tracking', included: true },
        { name: 'Exclusive deals', included: true },
        { name: 'Return protection', included: true },
        { name: 'Advanced analytics', included: false }
      ]
    },
    {
      name: 'Enterprise',
      price: 49.99,
      period: 'month',
      description: 'For businesses and power users',
      buttonText: 'Go Enterprise',
      featured: false,
      features: [
        { name: 'Unlimited orders', included: true },
        { name: '24/7 dedicated support', included: true },
        { name: 'Free express shipping', included: true },
        { name: 'Advanced order tracking', included: true },
        { name: 'Exclusive deals', included: true },
        { name: 'Return protection', included: true },
        { name: 'Advanced analytics', included: true },
        { name: 'API access', included: true },
        { name: 'Custom integrations', included: true }
      ]
    }
  ];

  $scope.faqs = [
    {
      question: 'Can I change my plan anytime?',
      answer: 'Yes, you can upgrade or downgrade your plan at any time. Changes will be reflected in your next billing cycle.',
      open: false
    },
    {
      question: 'Is there a free trial?',
      answer: 'We offer a 14-day free trial for all plans. No credit card required to get started.',
      open: false
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, PayPal, and bank transfers for enterprise customers.',
      open: false
    },
    {
      question: 'Can I cancel anytime?',
      answer: 'Yes, you can cancel your subscription at any time. You will continue to have access until the end of your billing period.',
      open: false
    }
  ];

  $scope.selectPlan = function(plan) {
    alert('You selected the ' + plan.name + ' plan for $' + plan.price + '/' + plan.period + '. This is a demo - no actual purchase will be made.');
  };

  $scope.toggleFaq = function(faq) {
    faq.open = !faq.open;
  };

  $scope.contactSales = function() {
    alert('Contact our sales team at sales@shopdemo.com or call 1-800-SHOP-NOW. This is a demo contact form.');
  };
});
