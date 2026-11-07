import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { adminGuard } from './guards/admin.guard';
import { sellerGuard } from './guards/seller.guard';
import { HomePageComponent } from './pages/home-page.component';
import { LoginPageComponent } from './pages/login-page.component';
import { SignupPageComponent } from './pages/signup-page.component';
import { ActivationPageComponent } from './pages/activation-page.component';
import { SellerActivationPageComponent } from './pages/seller-activation-page.component';
import { ProductsPageComponent } from './pages/products-page.component';
import { ProductDetailsPageComponent } from './pages/product-details-page.component';
import { BestSellingPageComponent } from './pages/best-selling-page.component';
import { EventsPageComponent } from './pages/events-page.component';
import { FaqPageComponent } from './pages/faq-page.component';
import { CheckoutPageComponent } from './pages/checkout-page.component';
import { PaymentPageComponent } from './pages/payment-page.component';
import { OrderSuccessPageComponent } from './pages/order-success-page.component';
import { ProfilePageComponent } from './pages/profile-page.component';
import { UserInboxPageComponent } from './pages/user-inbox-page.component';
import { OrderDetailsPageComponent } from './pages/order-details-page.component';
import { TrackOrderPageComponent } from './pages/track-order-page.component';
import { ShopPreviewPageComponent } from './pages/shop-preview-page.component';
import { ShopCreatePageComponent } from './pages/shop-create-page.component';
import { ShopLoginPageComponent } from './pages/shop-login-page.component';
import { ShopHomePageComponent } from './pages/shop/shop-home-page.component';
import { ShopDashboardPageComponent } from './pages/shop/shop-dashboard-page.component';
import { ShopCreateProductPageComponent } from './pages/shop/shop-create-product-page.component';
import { ShopAllProductsPageComponent } from './pages/shop/shop-all-products-page.component';
import { ShopCreateEventsPageComponent } from './pages/shop/shop-create-events-page.component';
import { ShopAllEventsPageComponent } from './pages/shop/shop-all-events-page.component';
import { ShopAllCouponsPageComponent } from './pages/shop/shop-all-coupons-page.component';
import { ShopAllOrdersPageComponent } from './pages/shop/shop-all-orders-page.component';
import { ShopOrderDetailsPageComponent } from './pages/shop/shop-order-details-page.component';
import { ShopAllRefundsPageComponent } from './pages/shop/shop-all-refunds-page.component';
import { ShopSettingsPageComponent } from './pages/shop/shop-settings-page.component';
import { ShopWithDrawMoneyPageComponent } from './pages/shop/shop-withdraw-money-page.component';
import { ShopInboxPageComponent } from './pages/shop/shop-inbox-page.component';
import { AdminDashboardPageComponent } from './pages/admin-dashboard-page.component';
import { AdminDashboardUsersPageComponent } from './pages/admin-dashboard-users-page.component';
import { AdminDashboardSellersPageComponent } from './pages/admin-dashboard-sellers-page.component';
import { AdminDashboardOrdersPageComponent } from './pages/admin-dashboard-orders-page.component';
import { AdminDashboardProductsPageComponent } from './pages/admin-dashboard-products-page.component';
import { AdminDashboardEventsPageComponent } from './pages/admin-dashboard-events-page.component';
import { AdminDashboardWithdrawPageComponent } from './pages/admin-dashboard-withdraw-page.component';

export const routes: Routes = [
  { path: '', component: HomePageComponent },
  { path: 'login', component: LoginPageComponent },
  { path: 'sign-up', component: SignupPageComponent },
  { path: 'activation/:activation_token', component: ActivationPageComponent },
  { path: 'seller/activation/:activation_token', component: SellerActivationPageComponent },
  { path: 'products', component: ProductsPageComponent },
  { path: 'product/:id', component: ProductDetailsPageComponent },
  { path: 'best-selling', component: BestSellingPageComponent },
  { path: 'events', component: EventsPageComponent },
  { path: 'faq', component: FaqPageComponent },
  { path: 'checkout', component: CheckoutPageComponent, canActivate: [authGuard] },
  { path: 'payment', component: PaymentPageComponent, canActivate: [authGuard] },
  { path: 'order/success', component: OrderSuccessPageComponent },
  { path: 'profile', component: ProfilePageComponent, canActivate: [authGuard] },
  { path: 'inbox', component: UserInboxPageComponent, canActivate: [authGuard] },
  { path: 'user/order/:id', component: OrderDetailsPageComponent, canActivate: [authGuard] },
  { path: 'user/track/order/:id', component: TrackOrderPageComponent, canActivate: [authGuard] },
  { path: 'shop/preview/:id', component: ShopPreviewPageComponent },
  { path: 'shop-create', component: ShopCreatePageComponent },
  { path: 'shop-login', component: ShopLoginPageComponent },
  { path: 'shop/:id', component: ShopHomePageComponent, canActivate: [sellerGuard] },
  { path: 'settings', component: ShopSettingsPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard', component: ShopDashboardPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard-create-product', component: ShopCreateProductPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard-orders', component: ShopAllOrdersPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard-refunds', component: ShopAllRefundsPageComponent, canActivate: [sellerGuard] },
  { path: 'order/:id', component: ShopOrderDetailsPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard-products', component: ShopAllProductsPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard-create-event', component: ShopCreateEventsPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard-events', component: ShopAllEventsPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard-coupouns', component: ShopAllCouponsPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard-withdraw-money', component: ShopWithDrawMoneyPageComponent, canActivate: [sellerGuard] },
  { path: 'dashboard-messages', component: ShopInboxPageComponent, canActivate: [sellerGuard] },
  { path: 'admin/dashboard', component: AdminDashboardPageComponent, canActivate: [adminGuard] },
  { path: 'admin-users', component: AdminDashboardUsersPageComponent, canActivate: [adminGuard] },
  { path: 'admin-sellers', component: AdminDashboardSellersPageComponent, canActivate: [adminGuard] },
  { path: 'admin-orders', component: AdminDashboardOrdersPageComponent, canActivate: [adminGuard] },
  { path: 'admin-products', component: AdminDashboardProductsPageComponent, canActivate: [adminGuard] },
  { path: 'admin-events', component: AdminDashboardEventsPageComponent, canActivate: [adminGuard] },
  { path: 'admin-withdraw-request', component: AdminDashboardWithdrawPageComponent, canActivate: [adminGuard] },
];
