import { Injectable, inject, signal } from '@angular/core';
import { ApiService } from './api.service';
import { server } from '../config';
import { Address, CartItem, EventModel, Order, Product, Shop, User } from './models';

const err = (api: ApiService, e: any) => api.message(e);

@Injectable({ providedIn: 'root' })
export class UserStore {
  private api = inject(ApiService);
  readonly isAuthenticated = signal(false);
  readonly loading = signal<boolean | undefined>(undefined);
  readonly addressloading = signal<boolean | undefined>(undefined);
  readonly usersLoading = signal<boolean | undefined>(undefined);
  readonly user = signal<User | null>(null);
  readonly users = signal<User[]>([]);
  readonly error = signal<string | null>(null);
  readonly successMessage = signal<string | null>(null);

  async loadUser() {
    try {
      this.loading.set(true);
      const data = await this.api.get(`${server}/user/getuser`, true);
      this.isAuthenticated.set(true); this.loading.set(false); this.user.set(data.user);
    } catch (e) { this.loading.set(false); this.error.set(err(this.api, e)); this.isAuthenticated.set(false); }
  }
  async updateUserInformation(name: string, email: string, phoneNumber: any, password: string) {
    try {
      this.loading.set(true);
      const data = await this.api.put(`${server}/user/update-user-info`, { email, password, phoneNumber, name }, true);
      this.loading.set(false); this.user.set(data.user);
    } catch (e) { this.loading.set(false); this.error.set(err(this.api, e)); }
  }
  async updatUserAddress(country: string, city: string, address1: string, address2: string, zipCode: string, addressType: string) {
    try {
      this.addressloading.set(true);
      const data = await this.api.put(`${server}/user/update-user-addresses`, { country, city, address1, address2, zipCode, addressType }, true);
      this.addressloading.set(false); this.successMessage.set('User address updated succesfully!'); this.user.set(data.user);
    } catch (e) { this.addressloading.set(false); this.error.set(err(this.api, e)); }
  }
  async deleteUserAddress(id: string) {
    try {
      this.addressloading.set(true);
      const data = await this.api.delete(`${server}/user/delete-user-address/${id}`, true);
      this.addressloading.set(false); this.successMessage.set('User deleted successfully!'); this.user.set(data.user);
    } catch (e) { this.addressloading.set(false); this.error.set(err(this.api, e)); }
  }
  async getAllUsers() {
    try {
      this.usersLoading.set(true);
      const data = await this.api.get(`${server}/user/admin-all-users`, true);
      this.usersLoading.set(false); this.users.set(data.users);
    } catch (e) { this.usersLoading.set(false); this.error.set(err(this.api, e)); }
  }
  clearErrors() { this.error.set(null); }
  clearMessages() { this.successMessage.set(null); }
}

@Injectable({ providedIn: 'root' })
export class SellerStore {
  private api = inject(ApiService);
  readonly isLoading = signal<boolean | undefined>(true);
  readonly isSeller = signal<boolean | undefined>(undefined);
  readonly seller = signal<Shop | null>(null);
  readonly sellers = signal<Shop[]>([]);
  readonly error = signal<string | null>(null);

  async loadSeller() {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/shop/getSeller`, true);
      this.isSeller.set(true); this.isLoading.set(false); this.seller.set(data.seller);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); this.isSeller.set(false); }
  }
  async getAllSellers() {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/shop/admin-all-sellers`, true);
      this.isLoading.set(false); this.sellers.set(data.sellers);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); }
  }
  clearErrors() { this.error.set(null); }
}

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private api = inject(ApiService);
  readonly isLoading = signal<boolean | undefined>(true);
  readonly product = signal<Product | null>(null);
  readonly products = signal<Product[]>([]);
  readonly allProducts = signal<Product[]>([]);
  readonly success = signal<boolean | undefined>(undefined);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  async createProduct(name: string, description: string, category: string, tags: string, originalPrice: number, discountPrice: number, stock: number, shopId: string, images: any) {
    try {
      this.isLoading.set(true);
      const data = await this.api.post(`${server}/product/create-product`, { name, description, category, tags, originalPrice, discountPrice, stock, shopId, images });
      this.isLoading.set(false); this.product.set(data.product); this.success.set(true); return data;
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); this.success.set(false); return null; }
  }
  async getAllProductsShop(id: string) {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/product/get-all-products-shop/${id}`);
      this.isLoading.set(false); this.products.set(data.products);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); }
  }
  async deleteProduct(id: string) {
    try {
      this.isLoading.set(true);
      const data = await this.api.delete(`${server}/product/delete-shop-product/${id}`, true);
      this.isLoading.set(false); this.message.set(data.message);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); }
  }
  async getAllProducts() {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/product/get-all-products`);
      this.isLoading.set(false); this.allProducts.set(data.products);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); }
  }
  clearErrors() { this.error.set(null); }
}

@Injectable({ providedIn: 'root' })
export class EventStore {
  private api = inject(ApiService);
  readonly isLoading = signal<boolean | undefined>(true);
  readonly event = signal<EventModel | null>(null);
  readonly events = signal<EventModel[]>([]);
  readonly allEvents = signal<EventModel[]>([]);
  readonly success = signal<boolean | undefined>(undefined);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  async createEvent(data: any) {
    try {
      this.isLoading.set(true);
      const res: any = await this.api.post(`${server}/event/create-event`, data);
      this.isLoading.set(false); this.event.set(res.event); this.success.set(true); return res;
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); this.success.set(false); return null; }
  }
  async getAllEventsShop(id: string) {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/event/get-all-events/${id}`);
      this.isLoading.set(false); this.events.set(data.events);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); }
  }
  async deleteEvent(id: string) {
    try {
      this.isLoading.set(true);
      const data = await this.api.delete(`${server}/event/delete-shop-event/${id}`, true);
      this.isLoading.set(false); this.message.set(data.message);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); }
  }
  async getAllEvents() {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/event/get-all-events`);
      this.isLoading.set(false); this.allEvents.set(data.events);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); }
  }
  clearErrors() { this.error.set(null); }
}

@Injectable({ providedIn: 'root' })
export class OrderStore {
  private api = inject(ApiService);
  readonly isLoading = signal<boolean | undefined>(true);
  readonly adminOrderLoading = signal<boolean | undefined>(undefined);
  readonly orders = signal<Order[]>([]);
  readonly adminOrders = signal<Order[]>([]);
  readonly error = signal<string | null>(null);

  async getAllOrdersOfUser(userId: string) {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/order/get-all-orders/${userId}`);
      this.isLoading.set(false); this.orders.set(data.orders);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); }
  }
  async getAllOrdersOfShop(shopId: string) {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/order/get-seller-all-orders/${shopId}`);
      this.isLoading.set(false); this.orders.set(data.orders);
    } catch (e) { this.isLoading.set(false); this.error.set(err(this.api, e)); }
  }
  async getAllOrdersOfAdmin() {
    try {
      this.adminOrderLoading.set(true);
      const data = await this.api.get(`${server}/order/admin-all-orders`, true);
      this.adminOrderLoading.set(false); this.adminOrders.set(data.orders);
    } catch (e) { this.adminOrderLoading.set(false); this.error.set(err(this.api, e)); }
  }
  clearErrors() { this.error.set(null); }
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  readonly cart = signal<CartItem[]>(this.read());
  private read(): CartItem[] { try { const raw = localStorage.getItem('cartItems'); return raw ? JSON.parse(raw) : []; } catch { return []; } }
  private persist() { localStorage.setItem('cartItems', JSON.stringify(this.cart())); }
  addTocart(data: CartItem) {
    const exist = this.cart().find((i) => i._id === data._id);
    this.cart.set(exist ? this.cart().map((i) => (i._id === exist._id ? data : i)) : [...this.cart(), data]);
    this.persist(); return data;
  }
  removeFromCart(data: CartItem) { this.cart.set(this.cart().filter((i) => i._id !== data._id)); this.persist(); return data; }
  clearCart() { this.cart.set([]); this.persist(); }
}

@Injectable({ providedIn: 'root' })
export class WishlistStore {
  readonly wishlist = signal<Product[]>(this.read());
  private read(): Product[] { try { const raw = localStorage.getItem('wishlistItems'); return raw ? JSON.parse(raw) : []; } catch { return []; } }
  private persist() { localStorage.setItem('wishlistItems', JSON.stringify(this.wishlist())); }
  addToWishlist(data: Product) {
    const exist = this.wishlist().find((i) => i._id === data._id);
    this.wishlist.set(exist ? this.wishlist().map((i) => (i._id === exist._id ? data : i)) : [...this.wishlist(), data]);
    this.persist(); return data;
  }
  removeFromWishlist(data: Product) { this.wishlist.set(this.wishlist().filter((i) => i._id !== data._id)); this.persist(); return data; }
}
