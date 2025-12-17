import { Injectable } from '@angular/core';
import { Product } from '../models/product.model';

@Injectable({
  providedIn: 'root'
})
export class ProductService {
  private products: Product[] = [
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

  getAllProducts(): Product[] {
    return this.products;
  }

  getProductById(id: number): Product | null {
    return this.products.find(product => product.id === id) || null;
  }

  searchProducts(query: string): Product[] {
    if (!query) {
      return this.products;
    }
    
    const lowerQuery = query.toLowerCase();
    return this.products.filter(product =>
      product.name.toLowerCase().includes(lowerQuery) ||
      product.description.toLowerCase().includes(lowerQuery)
    );
  }
}