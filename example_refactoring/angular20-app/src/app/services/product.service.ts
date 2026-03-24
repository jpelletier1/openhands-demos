import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
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

  getAllProducts(): Observable<Product[]> {
    return of([...this.products]);
  }

  getProductById(id: number): Observable<Product | null> {
    return of(this.products.find(product => product.id === id) || null);
  }

  searchProducts(query: string): Observable<Product[]> {
    if (!query) {
      return of([...this.products]);
    }
    
    const lowerQuery = query.toLowerCase();
    return of(
      this.products.filter(product =>
        product.name.toLowerCase().includes(lowerQuery) ||
        product.description.toLowerCase().includes(lowerQuery)
      )
    );
  }
}