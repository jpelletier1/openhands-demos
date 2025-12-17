import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { CartItem } from '../../models/cart-item.model';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-cart',
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css'],
  standalone: false
})
export class CartComponent implements OnInit {
  cartItems$: Observable<CartItem[]>;

  constructor(
    private cartService: CartService,
    private router: Router
  ) {
    this.cartItems$ = this.cartService.getCart();
  }

  ngOnInit(): void {}

  removeItem(index: number): void {
    this.cartService.removeFromCart(index);
  }

  getTotal(): number {
    return this.cartService.getTotal();
  }

  goToProduct(id: number): void {
    this.router.navigate(['/product', id]);
  }

  continueShopping(): void {
    this.router.navigate(['/']);
  }
}