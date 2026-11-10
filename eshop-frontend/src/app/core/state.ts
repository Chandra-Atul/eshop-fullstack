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

  private userPromise: Promise<boolean> | null = null;

  loadUser(): Promise<boolean> {
    if (this.userPromise) {
      return this.userPromise;
    }

    this.loading.set(true);
    this.userPromise = (async () => {
      try {
        const data = await this.api.get(`${server}/user/getuser`, true);
        if (data && data.user) {
          this.user.set(data.user);
          this.isAuthenticated.set(true);
          this.loading.set(false);
          return true;
        } else {
          this.isAuthenticated.set(false);
          this.loading.set(false);
          return false;
        }
      } catch (e) {
        this.loading.set(false);
        this.error.set(err(this.api, e));
        this.isAuthenticated.set(false);
        return false;
      } finally {
        this.userPromise = null;
      }
    })();

    return this.userPromise;
  }

  async updateUserInformation(name: string, email: string, phoneNumber: any, password: string) {
    try {
      this.loading.set(true);
      const data = await this.api.put(`${server}/user/update-user-info`, { email, password, phoneNumber, name }, true);
      this.loading.set(false);
      this.user.set(data.user);
    } catch (e) {
      this.loading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  async updatUserAddress(country: string, city: string, address1: string, address2: string, zipCode: string, addressType: string) {
    try {
      this.addressloading.set(true);
      const data = await this.api.put(`${server}/user/update-user-addresses`, { country, city, address1, address2, zipCode, addressType }, true);
      this.addressloading.set(false);
      this.successMessage.set('User address updated successfully!');
      this.user.set(data.user);
    } catch (e) {
      this.addressloading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  async deleteUserAddress(id: string) {
    try {
      this.addressloading.set(true);
      const data = await this.api.delete(`${server}/user/delete-user-address/${id}`, true);
      this.addressloading.set(false);
      this.successMessage.set('Address deleted successfully!');
      this.user.set(data.user);
    } catch (e) {
      this.addressloading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  async getAllUsers() {
    try {
      this.usersLoading.set(true);
      const data = await this.api.get(`${server}/user/admin-all-users`, true);
      this.usersLoading.set(false);
      this.users.set(data.users);
    } catch (e) {
      this.usersLoading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  clearErrors() {
    this.error.set(null);
  }

  clearMessages() {
    this.successMessage.set(null);
  }
}

@Injectable({ providedIn: 'root' })
export class SellerStore {
  private api = inject(ApiService);
  readonly isLoading = signal<boolean | undefined>(true);
  readonly isSeller = signal<boolean | undefined>(undefined);
  readonly seller = signal<Shop | null>(null);
  readonly sellers = signal<Shop[]>([]);
  readonly error = signal<string | null>(null);

  private sellerPromise: Promise<boolean> | null = null;

  loadSeller(): Promise<boolean> {
    if (this.sellerPromise) {
      return this.sellerPromise;
    }

    this.isLoading.set(true);
    this.sellerPromise = (async () => {
      try {
        const data: any = await this.api.get(`${server}/shop/getSeller`, true);
        const raw = data?.user || data?.seller || data?.shop || (data?.id || data?._id ? data : null);

        if (raw && (raw.id || raw._id)) {
          const normalized: any = {
            ...raw,
            _id: raw._id || String(raw.id),
          };
          this.seller.set(normalized);
          this.isSeller.set(true);
          this.isLoading.set(false);
          return true;
        } else {
          this.seller.set(null);
          this.isSeller.set(false);
          this.isLoading.set(false);
          return false;
        }
      } catch (e) {
        this.seller.set(null);
        this.isLoading.set(false);
        this.error.set(err(this.api, e));
        this.isSeller.set(false);
        return false;
      } finally {
        this.sellerPromise = null;
      }
    })();

    return this.sellerPromise;
  }

  async getAllSellers() {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/shop/admin-all-sellers`, true);
      this.isLoading.set(false);
      this.sellers.set(data.sellers);
    } catch (e) {
      this.isLoading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  clearErrors() {
    this.error.set(null);
  }
}

@Injectable({ providedIn: 'root' })
export class ProductStore {
  private api = inject(ApiService);
  readonly isLoading = signal<boolean | undefined>(false);
  readonly product = signal<Product | null>(null);
  readonly products = signal<Product[]>([]);
  readonly allProducts = signal<Product[]>([]);
  readonly success = signal<boolean | undefined>(undefined);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  async createProduct(
      name: string,
      description: string,
      category: string,
      tags: string,
      originalPrice: number,
      discountPrice: number,
      stock: number,
      shopId: string,
      images: any
  ) {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      this.success.set(undefined);

      const parsedShopId = isNaN(Number(shopId)) ? shopId : Number(shopId);
      const payload = {
        name,
        description,
        category,
        tags,
        originalPrice,
        discountPrice,
        stock,
        shopId: parsedShopId,
        shop: { id: parsedShopId, _id: shopId },
        images,
      };

      const data = await this.api.post(`${server}/product/create-product`, payload, true);

      this.isLoading.set(false);
      this.product.set(data.product || data);
      this.success.set(true);
      return data;
    } catch (e) {
      this.isLoading.set(false);
      const errorMsg = err(this.api, e);
      this.error.set(errorMsg);
      this.success.set(false);
      throw e;
    }
  }

  async getAllProductsShop(id: string) {
    try {
      this.isLoading.set(true);
      const data: any = await this.api.get(`${server}/product/get-all-products-shop/${id}`);
      this.isLoading.set(false);

      // Extract whichever key the backend provides
      const list =
          data?.products ||
          data?.product ||
          data?.allProducts ||
          data?.data ||
          (Array.isArray(data) ? data : []);

      this.products.set(list);
    } catch (e) {
      this.isLoading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  async deleteProduct(id: string) {
    try {
      this.isLoading.set(true);
      const data = await this.api.delete(`${server}/product/delete-shop-product/${id}`, true);
      this.isLoading.set(false);
      this.message.set(data.message);
    } catch (e) {
      this.isLoading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  async getAllProducts() {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/product/get-all-products`);
      this.isLoading.set(false);
      this.allProducts.set(data.products || []);
    } catch (e) {
      this.isLoading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  clearErrors() {
    this.error.set(null);
  }
}

@Injectable({ providedIn: 'root' })
export class EventStore {
  private api = inject(ApiService);
  readonly isLoading = signal<boolean | undefined>(false);
  readonly event = signal<EventModel | null>(null);
  readonly events = signal<EventModel[]>([]);
  readonly allEvents = signal<EventModel[]>([]);
  readonly success = signal<boolean | undefined>(undefined);
  readonly message = signal<string | null>(null);
  readonly error = signal<string | null>(null);

  async createEvent(data: any) {
    try {
      this.isLoading.set(true);
      this.error.set(null);
      this.success.set(undefined);

      const parsedShopId = isNaN(Number(data.shopId)) ? data.shopId : Number(data.shopId);
      const payload = {
        ...data,
        shopId: parsedShopId,
        shop: { id: parsedShopId, _id: data.shopId },
      };

      const res: any = await this.api.post(`${server}/event/create-event`, payload, true);
      this.isLoading.set(false);
      this.event.set(res.event || res);
      this.success.set(true);
      return res;
    } catch (e) {
      this.isLoading.set(false);
      const errorMsg = err(this.api, e);
      this.error.set(errorMsg);
      this.success.set(false);
      throw e;
    }
  }

  async getAllEventsShop(id: string) {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/event/get-all-events/${id}`);
      this.isLoading.set(false);
      this.events.set(data.events || []);
    } catch (e) {
      this.isLoading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  async deleteEvent(id: string) {
    try {
      this.isLoading.set(true);
      const data = await this.api.delete(`${server}/event/delete-shop-event/${id}`, true);
      this.isLoading.set(false);
      this.message.set(data.message);
    } catch (e) {
      this.isLoading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  async getAllEvents() {
    try {
      this.isLoading.set(true);
      const data = await this.api.get(`${server}/event/get-all-events`);
      this.isLoading.set(false);
      this.allEvents.set(data.events || []);
    } catch (e) {
      this.isLoading.set(false);
      this.error.set(err(this.api, e));
      throw e;
    }
  }

  clearErrors() {
    this.error.set(null);
  }
}

@Injectable({ providedIn: 'root' })
export class OrderStore {
  private api = inject(ApiService);
  readonly isLoading = signal<boolean | undefined>(true);
  readonly adminOrderLoading = signal<boolean | undefined>(undefined);
  readonly orders = signal<Order[]>([]);
  readonly adminOrders = signal<Order[]>([]);
  readonly error = signal<string | null>(null);

  async getAllOrdersOfUser(userId: string | number) {
    if (!userId || userId === 'undefined') return;
    try {
      this.isLoading.set(true);
      // Added 'true' so withCredentials and auth headers are included
      const data: any = await this.api.get(`${server}/order/get-all-orders/${userId}`, true);
      this.isLoading.set(false);
      this.orders.set(data?.orders || []);
    } catch (e) {
      this.isLoading.set(false);
      this.error.set(err(this.api, e));
      this.orders.set([]);
    }
  }

  async getAllOrdersOfShop(shopId: string | number) {
    if (!shopId || shopId === 'undefined') return;
    try {
      this.isLoading.set(true);
      // Added 'true' so withCredentials and auth headers are included
      const data: any = await this.api.get(`${server}/order/get-seller-all-orders/${shopId}`, true);
      this.isLoading.set(false);
      this.orders.set(data?.orders || []);
    } catch (e) {
      this.isLoading.set(false);
      this.error.set(err(this.api, e));
      this.orders.set([]);
    }
  }

  async getAllOrdersOfAdmin() {
    try {
      this.adminOrderLoading.set(true);
      const data = await this.api.get(`${server}/order/admin-all-orders`, true);
      this.adminOrderLoading.set(false);
      this.adminOrders.set(data?.orders || []);
    } catch (e) {
      this.adminOrderLoading.set(false);
      this.error.set(err(this.api, e));
    }
  }

  clearErrors() {
    this.error.set(null);
  }
}

@Injectable({ providedIn: 'root' })
export class CartStore {
  readonly cart = signal<CartItem[]>(this.read());

  private read(): CartItem[] {
    try {
      const raw = typeof window !== 'undefined' ? localStorage.getItem('cartItems') : null;
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('cartItems', JSON.stringify(this.cart()));
    }
  }

  /**
   * Adds an item with the explicitly selected count.
   * If existing: adds the exact selected amount or sets the new total.
   */
  addTocart(data: any, quantityToAdd: number = 1) {
    const targetId = String(data._id || data.id);
    const qtySelected = Number(data.qty ?? quantityToAdd ?? 1);
    const currentList = this.cart();
    const existIndex = currentList.findIndex((i: any) => String(i._id || i.id) === targetId);

    if (existIndex > -1) {
      const existingItem = currentList[existIndex];
      // Increment by the selected amount rather than a hardcoded +1
      const updatedQty = (Number(existingItem.qty) || 1) + qtySelected;

      const updatedItem = {
        ...existingItem,
        ...data,
        _id: targetId,
        id: targetId,
        qty: updatedQty,
      };

      const nextList = [...currentList];
      nextList[existIndex] = updatedItem;
      this.cart.set(nextList);
      this.persist();
      return updatedItem;
    } else {
      const newItem = {
        ...data,
        _id: targetId,
        id: targetId,
        qty: Math.max(1, qtySelected),
      };
      this.cart.set([...currentList, newItem]);
      this.persist();
      return newItem;
    }
  }

  updateQuantity(id: string | number, qty: number) {
    const targetId = String(id);
    if (qty <= 0) {
      this.removeFromCart(targetId);
      return;
    }

    const nextList = this.cart().map((item: any) => {
      if (String(item._id || item.id) === targetId) {
        return { ...item, qty };
      }
      return item;
    });

    this.cart.set(nextList);
    this.persist();
  }

  removeFromCart(dataOrId: any) {
    const targetId = String(dataOrId?._id || dataOrId?.id || dataOrId);
    this.cart.set(this.cart().filter((i: any) => String(i._id || i.id) !== targetId));
    this.persist();
  }

  clearCart() {
    this.cart.set([]);
    this.persist();
  }
}
@Injectable({ providedIn: 'root' })
export class WishlistStore {
  readonly wishlist = signal<Product[]>(this.read());

  private read(): Product[] {
    try {
      const raw = localStorage.getItem('wishlistItems');
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  private persist() {
    localStorage.setItem('wishlistItems', JSON.stringify(this.wishlist()));
  }

  addToWishlist(data: Product) {
    const exist = this.wishlist().find((i) => i._id === data._id);
    this.wishlist.set(exist ? this.wishlist().map((i) => (i._id === exist._id ? data : i)) : [...this.wishlist(), data]);
    this.persist();
    return data;
  }

  removeFromWishlist(data: Product) {
    this.wishlist.set(this.wishlist().filter((i) => i._id !== data._id));
    this.persist();
    return data;
  }
}