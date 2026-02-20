import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CartService } from './services/cart.service';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
  standalone: false
})
export class AppComponent implements OnInit {
  cartCount$: Observable<number>;

  constructor(
    private router: Router,
    private cartService: CartService
  ) {
    this.cartCount$ = this.cartService.getCart().pipe(
      map(items => items.length)
    );
  }

  ngOnInit(): void {}

  goToCart(): void {
    this.router.navigate(['/cart']);
  }
}