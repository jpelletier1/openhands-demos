import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ProductService } from '../../services/product.service';
import { CartService } from '../../services/cart.service';
import { Product } from '../../models/product.model';
import { Location } from '@angular/common';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.css'],
  standalone: false
})
export class ProductComponent implements OnInit, OnDestroy {
  product: Product | null = null;
  added: boolean = false;
  private routeParamsSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private location: Location,
    private productService: ProductService,
    private cartService: CartService
  ) {}

  ngOnInit(): void {
    this.routeParamsSubscription = this.route.params.subscribe(params => {
      const productId = parseInt(params['id'], 10);
      this.productService.getProductById(productId).subscribe(product => {
        this.product = product;

        if (!this.product) {
          this.router.navigate(['/']);
        }
      });
    });
  }

  ngOnDestroy(): void {
    this.routeParamsSubscription?.unsubscribe();
  }

  addToCart(): void {
    if (this.product) {
      this.cartService.addToCart(this.product);
      this.added = true;
      
      setTimeout(() => {
        this.added = false;
      }, 2000);
    }
  }

  goBack(): void {
    this.location.back();
  }
}