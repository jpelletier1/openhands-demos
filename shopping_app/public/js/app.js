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
