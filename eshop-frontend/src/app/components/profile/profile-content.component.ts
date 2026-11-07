import { Component, Input, OnInit, computed, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Country, State } from 'country-state-city';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { OrderStore, UserStore } from '../../core/state';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { server } from '../../config';
import { DataTableComponent, GridColumn } from '../../shared/data-table.component';

@Component({
  selector: 'app-orders-table',
  standalone: true,
  imports: [DataTableComponent],
  template: `<div class="pl-8 pt-1"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" /></div>`,
})
export class OrdersTableComponent implements OnInit {
  private userStore = inject(UserStore);
  private orderStore = inject(OrderStore);
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Order ID', minWidth: 150, flex: 0.7 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7, statusColor: true },
    { field: 'itemsQty', headerName: 'Items Qty', type: 'number', minWidth: 130, flex: 0.7 },
    { field: 'total', headerName: 'Total', type: 'number', minWidth: 130, flex: 0.8 },
    { field: ' ', headerName: '', flex: 1, minWidth: 150, linkPrefix: '/user/order', icon: 'AiOutlineArrowRight' },
  ];
  row = computed(() => (this.orderStore.orders() || []).map((i) => ({ id: i._id, itemsQty: i.cart.length, total: 'US$ ' + i.totalPrice, status: i.status })));
  ngOnInit() { const user = this.userStore.user(); if (user) this.orderStore.getAllOrdersOfUser(user._id); }
}

@Component({
  selector: 'app-refund-table',
  standalone: true,
  imports: [DataTableComponent],
  template: `<div class="pl-8 pt-1"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" /></div>`,
})
export class RefundTableComponent implements OnInit {
  private userStore = inject(UserStore);
  private orderStore = inject(OrderStore);
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Order ID', minWidth: 150, flex: 0.7 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7, statusColor: true },
    { field: 'itemsQty', headerName: 'Items Qty', type: 'number', minWidth: 130, flex: 0.7 },
    { field: 'total', headerName: 'Total', type: 'number', minWidth: 130, flex: 0.8 },
    { field: ' ', headerName: '', flex: 1, minWidth: 150, linkPrefix: '/user/order', icon: 'AiOutlineArrowRight' },
  ];
  row = computed(() => (this.orderStore.orders() || []).filter((i) => i.status === 'Processing refund')
      .map((i) => ({ id: i._id, itemsQty: i.cart.length, total: 'US$ ' + i.totalPrice, status: i.status })));
  ngOnInit() { const user = this.userStore.user(); if (user) this.orderStore.getAllOrdersOfUser(user._id); }
}

@Component({
  selector: 'app-track-table',
  standalone: true,
  imports: [DataTableComponent],
  template: `<div class="pl-8 pt-1"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" /></div>`,
})
export class TrackTableComponent implements OnInit {
  private userStore = inject(UserStore);
  private orderStore = inject(OrderStore);
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Order ID', minWidth: 150, flex: 0.7 },
    { field: 'status', headerName: 'Status', minWidth: 130, flex: 0.7, statusColor: true },
    { field: 'itemsQty', headerName: 'Items Qty', type: 'number', minWidth: 130, flex: 0.7 },
    { field: 'total', headerName: 'Total', type: 'number', minWidth: 130, flex: 0.8 },
    { field: ' ', headerName: '', flex: 1, minWidth: 150, linkPrefix: '/user/track/order', icon: 'MdTrackChanges' },
  ];
  row = computed(() => (this.orderStore.orders() || []).map((i) => ({ id: i._id, itemsQty: i.cart.length, total: 'US$ ' + i.totalPrice, status: i.status })));
  ngOnInit() { const user = this.userStore.user(); if (user) this.orderStore.getAllOrdersOfUser(user._id); }
}

@Component({
  selector: 'app-change-password',
  standalone: true,
  imports: [FormsModule],
  template: `<div class="w-full px-5">
    <h1 class="block text-[25px] text-center font-[600] text-[#000000ba] pb-2">Change Password</h1>
    <div class="w-full"><form (ngSubmit)="passwordChangeHandler($event)" class="flex flex-col items-center">
      <div class="w-[100%] 800px:w-[50%] mt-5"><label class="block pb-2">Enter your old password</label>
        <input type="password" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required [(ngModel)]="oldPassword" name="oldPassword" /></div>
      <div class="w-[100%] 800px:w-[50%] mt-2"><label class="block pb-2">Enter your new password</label>
        <input type="password" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required [(ngModel)]="newPassword" name="newPassword" /></div>
      <div class="w-[100%] 800px:w-[50%] mt-2"><label class="block pb-2">Enter your confirm password</label>
        <input type="password" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required [(ngModel)]="confirmPassword" name="confirmPassword" />
        <input class="w-[95%] h-[40px] border border-[#3a24db] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer" required value="Update" type="submit" /></div>
    </form></div>
  </div>`,
})
export class ChangePasswordComponent {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  styles = styles;
  oldPassword = ''; newPassword = ''; confirmPassword = '';
  async passwordChangeHandler(e: Event) {
    e.preventDefault();
    try {
      const res: any = await this.api.put(`${server}/user/update-user-password`, { oldPassword: this.oldPassword, newPassword: this.newPassword, confirmPassword: this.confirmPassword }, true);
      this.toast.success(res.success);
      this.oldPassword = ''; this.newPassword = ''; this.confirmPassword = '';
    } catch (error) { this.toast.error(this.api.message(error)); }
  }
}

@Component({
  selector: 'app-address-book',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `<div class="w-full px-5">
    @if (open()) {
      <div class="fixed w-full h-screen bg-[#0000004b] top-0 left-0 flex items-center justify-center">
        <div class="w-[35%] h-[80vh] bg-white rounded shadow relative overflow-y-scroll">
          <div class="w-full flex justify-end p-3"><app-icon name="RxCross1" [size]="30" class="cursor-pointer" (click)="open.set(false)" /></div>
          <h1 class="text-center text-[25px] font-Poppins">Add New Address</h1>
          <div class="w-full"><form (ngSubmit)="handleSubmit($event)" class="w-full"><div class="w-full block p-4">
            <div class="w-full pb-2"><label class="block pb-2">Country</label>
              <select [value]="country" (change)="country = $any($event.target).value" class="w-[95%] border h-[40px] rounded-[5px]">
                <option value="">choose your country</option>
                @for (item of countries; track item.isoCode) { <option [value]="item.isoCode">{{ item.name }}</option> }
              </select></div>
            <div class="w-full pb-2"><label class="block pb-2">Choose your City</label>
              <select [value]="city" (change)="city = $any($event.target).value" class="w-[95%] border h-[40px] rounded-[5px]">
                <option value="">choose your city</option>
                @for (item of states; track item.isoCode) { <option [value]="item.isoCode">{{ item.name }}</option> }
              </select></div>
            <div class="w-full pb-2"><label class="block pb-2">Address 1</label>
              <input type="text" class="{{ styles.input }}" required [(ngModel)]="address1" name="address1" /></div>
            <div class="w-full pb-2"><label class="block pb-2">Address 2</label>
              <input type="text" class="{{ styles.input }}" required [(ngModel)]="address2" name="address2" /></div>
            <div class="w-full pb-2"><label class="block pb-2">Zip Code</label>
              <input type="number" class="{{ styles.input }}" required [(ngModel)]="zipCode" name="zipCode" /></div>
            <div class="w-full pb-2"><label class="block pb-2">Address Type</label>
              <select [value]="addressType" (change)="addressType = $any($event.target).value" class="w-[95%] border h-[40px] rounded-[5px]">
                <option value="">Choose your Address Type</option>
                @for (item of addressTypeData; track item.name) { <option [value]="item.name">{{ item.name }}</option> }
              </select></div>
            <div class="w-full pb-2"><input type="submit" class="{{ styles.input }} mt-5 cursor-pointer" value="Submit" /></div>
          </div></form></div>
        </div>
      </div>
    }
    <div class="flex w-full items-center justify-between">
      <h1 class="text-[25px] font-[600] text-[#000000ba] pb-2">My Addresses</h1>
      <div class="{{ styles.button }} !rounded-md" (click)="open.set(true)"><span class="text-[#fff]">Add New</span></div>
    </div><br />
    @if (user()) {
      @for (item of user()!.addresses || []; track item._id) {
        <div class="w-full bg-white h-min 800px:h-[70px] rounded-[4px] flex items-center px-3 shadow justify-between pr-10 mb-5">
          <div class="flex items-center"><h5 class="pl-5 font-[600]">{{ item.addressType }}</h5></div>
          <div class="pl-8 flex items-center"><h6 class="text-[12px] 800px:text-[unset]">{{ item.address1 }} {{ item.address2 }}</h6></div>
          <div class="pl-8 flex items-center"><h6 class="text-[12px] 800px:text-[unset]">{{ user()!.phoneNumber }}</h6></div>
          <div class="min-w-[10%] flex items-center justify-between pl-8"><app-icon name="AiOutlineDelete" [size]="25" class="cursor-pointer" (click)="handleDelete(item)" /></div>
        </div>
      }
      @if ((user()!.addresses || []).length === 0) { <h5 class="text-center pt-8 text-[18px]">You not have any saved address!</h5> }
    }
  </div>`,
})
export class AddressBookComponent {
  private userStore = inject(UserStore);
  private toast = inject(ToastService);
  styles = styles;
  user = this.userStore.user;
  open = signal(false);
  country = ''; city = ''; zipCode: any = null; address1 = ''; address2 = ''; addressType = '';
  addressTypeData = [{ name: 'Default' }, { name: 'Home' }, { name: 'Office' }];
  countries = Country.getAllCountries();
  get states() { return this.country ? State.getStatesOfCountry(this.country) : []; }
  handleSubmit(e: Event) {
    e.preventDefault();
    if (this.addressType === '' || this.country === '' || this.city === '') { this.toast.error('Please fill all the fields!'); }
    else {
      this.userStore.updatUserAddress(this.country, this.city, this.address1, this.address2, this.zipCode, this.addressType);
      this.open.set(false);
      this.country = ''; this.city = ''; this.address1 = ''; this.address2 = ''; this.zipCode = null; this.addressType = '';
    }
  }
  handleDelete(item: any) { this.userStore.deleteUserAddress(item._id); }
}

@Component({
  selector: 'app-profile-content',
  standalone: true,
  imports: [FormsModule, RouterLink, IconComponent, DataTableComponent, OrdersTableComponent, RefundTableComponent, TrackTableComponent, ChangePasswordComponent, AddressBookComponent],
  template: `<div class="w-full">
    @if (active === 1) {
      <div class="flex justify-center w-full"><div class="relative">
        <img [src]="user()?.avatar?.url" class="w-[150px] h-[150px] rounded-full object-cover border-[3px] border-[#3ad132]" alt="" />
        <div class="w-[30px] h-[30px] bg-[#E3E9EE] rounded-full flex items-center justify-center cursor-pointer absolute bottom-[5px] right-[5px]">
          <input type="file" id="image" class="hidden" (change)="handleImage($event)" /><label for="image"><app-icon name="AiOutlineCamera" /></label></div>
      </div></div><br /><br />
      <div class="w-full px-5"><form (ngSubmit)="handleSubmit($event)">
        <div class="w-full 800px:flex block pb-3">
          <div class="w-[100%] 800px:w-[50%]"><label class="block pb-2">Full Name</label>
            <input type="text" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required [(ngModel)]="name" name="name" /></div>
          <div class="w-[100%] 800px:w-[50%]"><label class="block pb-2">Email Address</label>
            <input type="text" class="{{ styles.input }} !w-[95%] mb-1 800px:mb-0" required [(ngModel)]="email" name="email" /></div>
        </div>
        <div class="w-full 800px:flex block pb-3">
          <div class="w-[100%] 800px:w-[50%]"><label class="block pb-2">Phone Number</label>
            <input type="number" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required [(ngModel)]="phoneNumber" name="phoneNumber" /></div>
          <div class="w-[100%] 800px:w-[50%]"><label class="block pb-2">Enter your password</label>
            <input type="password" class="{{ styles.input }} !w-[95%] mb-4 800px:mb-0" required [(ngModel)]="password" name="password" /></div>
        </div>
        <input class="w-[250px] h-[40px] border border-[#3a24db] text-center text-[#3a24db] rounded-[3px] mt-8 cursor-pointer" required value="Update" type="submit" />
      </form></div>
    }
    @if (active === 2) { <div><app-orders-table /></div> }
    @if (active === 3) { <div><app-refund-table /></div> }
    @if (active === 5) { <div><app-track-table /></div> }
    @if (active === 6) { <div><app-change-password /></div> }
    @if (active === 7) { <div><app-address-book /></div> }
  </div>`,
})
export class ProfileContentComponent {
  private userStore = inject(UserStore);
  private toast = inject(ToastService);
  private api = inject(ApiService);
  @Input() active = 1;
  styles = styles;
  user = this.userStore.user;
  name = ''; email = ''; phoneNumber: any = ''; password = '';
  avatar = signal<string | null>(null);
  constructor() {
    effect(() => {
      const u = this.userStore.user();
      if (u) { this.name = u.name; this.email = u.email; this.phoneNumber = u.phoneNumber; }
    });
    effect(() => {
      const error = this.userStore.error();
      if (error) { this.toast.error(error); this.userStore.clearErrors(); }
      const successMessage = this.userStore.successMessage();
      if (successMessage) { this.toast.success(successMessage); this.userStore.clearMessages(); }
    });
  }
  handleSubmit(e: Event) { e.preventDefault(); this.userStore.updateUserInformation(this.name, this.email, this.phoneNumber, this.password); }
  async handleImage(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      if (reader.readyState === 2) {
        this.avatar.set(reader.result as string);
        try { await this.api.put(`${server}/user/update-avatar`, { avatar: reader.result }, true); this.userStore.loadUser(); this.toast.success('avatar updated successfully!'); }
        catch (error) { this.toast.error(this.api.message(error)); }
      }
    };
    reader.readAsDataURL(file);
  }
}