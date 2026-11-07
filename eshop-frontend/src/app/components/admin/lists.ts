import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { SellerStore, UserStore } from '../../core/state';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { server } from '../../config';
import { DataTableComponent, GridColumn } from '../../shared/data-table.component';

@Component({
  selector: 'app-all-users',
  standalone: true,
  imports: [IconComponent, DataTableComponent],
  template: `<div class="w-full flex justify-center pt-5"><div class="w-[97%]">
    <h3 class="text-[22px] font-Poppins pb-2">All Users</h3>
    <div class="w-full min-h-[45vh] bg-white rounded"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" (cellAction)="onCellAction($event)" /></div>
    @if (open()) {
      <div class="w-full fixed top-0 left-0 z-[999] bg-[#00000039] flex items-center justify-center h-screen">
        <div class="w-[95%] 800px:w-[40%] min-h-[20vh] bg-white rounded shadow p-5">
          <div class="w-full flex justify-end cursor-pointer"><app-icon name="RxCross1" [size]="25" (click)="open.set(false)" /></div>
          <h3 class="text-[25px] text-center py-5 font-Poppins text-[#000000cb]">Are you sure you wanna delete this user?</h3>
          <div class="w-full flex items-center justify-center">
            <div class="{{ styles.button }} text-white text-[18px] !h-[42px] mr-4" (click)="open.set(false)">cancel</div>
            <div class="{{ styles.button }} text-white text-[18px] !h-[42px] ml-4" (click)="confirmDelete()">confirm</div>
          </div>
        </div>
      </div>
    }
  </div></div>`,
})
export class AllUsersComponent implements OnInit {
  private userStore = inject(UserStore);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  styles = styles;
  open = signal(false);
  userId = signal('');
  columns: GridColumn[] = [
    { field: 'id', headerName: 'User ID', minWidth: 150, flex: 0.7 },
    { field: 'name', headerName: 'name', minWidth: 130, flex: 0.7 },
    { field: 'email', headerName: 'Email', minWidth: 130, flex: 0.7 },
    { field: 'role', headerName: 'User Role', minWidth: 130, flex: 0.7 },
    { field: 'joinedAt', headerName: 'joinedAt', minWidth: 130, flex: 0.8 },
    { field: ' ', headerName: 'Delete User', flex: 1, minWidth: 150, actionIcon: 'AiOutlineDelete' },
  ];
  row = computed(() => (this.userStore.users() || []).map((i) => ({ id: i._id, name: i.name, email: i.email, role: i.role, joinedAt: i.createdAt?.slice(0, 10) })));
  ngOnInit() { this.userStore.getAllUsers(); }
  onCellAction(e: any) { this.userId.set(e.row.id); this.open.set(true); }
  confirmDelete() { this.open.set(false); this.handleDelete(this.userId()); }
  async handleDelete(id: string) {
    try { const res: any = await this.api.delete(`${server}/user/delete-user/${id}`, true); this.toast.success(res.message); }
    catch (error) { this.toast.error(this.api.message(error)); }
    this.userStore.getAllUsers();
  }
}

@Component({
  selector: 'app-all-sellers',
  standalone: true,
  imports: [IconComponent, DataTableComponent],
  template: `<div class="w-full flex justify-center pt-5"><div class="w-[97%]">
    <h3 class="text-[22px] font-Poppins pb-2">All Users</h3>
    <div class="w-full min-h-[45vh] bg-white rounded"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" (cellAction)="onCellAction($event)" /></div>
    @if (open()) {
      <div class="w-full fixed top-0 left-0 z-[999] bg-[#00000039] flex items-center justify-center h-screen">
        <div class="w-[95%] 800px:w-[40%] min-h-[20vh] bg-white rounded shadow p-5">
          <div class="w-full flex justify-end cursor-pointer"><app-icon name="RxCross1" [size]="25" (click)="open.set(false)" /></div>
          <h3 class="text-[25px] text-center py-5 font-Poppins text-[#000000cb]">Are you sure you wanna delete this user?</h3>
          <div class="w-full flex items-center justify-center">
            <div class="{{ styles.button }} text-white text-[18px] !h-[42px] mr-4" (click)="open.set(false)">cancel</div>
            <div class="{{ styles.button }} text-white text-[18px] !h-[42px] ml-4" (click)="confirmDelete()">confirm</div>
          </div>
        </div>
      </div>
    }
  </div></div>`,
})
export class AllSellersComponent implements OnInit {
  private sellerStore = inject(SellerStore);
  private api = inject(ApiService);
  private toast = inject(ToastService);
  styles = styles;
  open = signal(false);
  userId = signal('');
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Seller ID', minWidth: 150, flex: 0.7 },
    { field: 'name', headerName: 'name', minWidth: 130, flex: 0.7 },
    { field: 'email', headerName: 'Email', minWidth: 130, flex: 0.7 },
    { field: 'address', headerName: 'Seller Address', minWidth: 130, flex: 0.7 },
    { field: 'joinedAt', headerName: 'joinedAt', minWidth: 130, flex: 0.8 },
    { field: '  ', headerName: 'Preview Shop', flex: 1, minWidth: 150, linkPrefix: '/shop/preview', icon: 'AiOutlineEye' },
    { field: ' ', headerName: 'Delete Seller', flex: 1, minWidth: 150, actionIcon: 'AiOutlineDelete' },
  ];
  row = computed(() => (this.sellerStore.sellers() || []).map((i) => ({ id: i._id, name: i?.name, email: i?.email, joinedAt: i.createdAt?.slice(0, 10), address: i.address })));
  ngOnInit() { this.sellerStore.getAllSellers(); }
  onCellAction(e: any) { this.userId.set(e.row.id); this.open.set(true); }
  confirmDelete() { this.open.set(false); this.handleDelete(this.userId()); }
  async handleDelete(id: string) {
    try { const res: any = await this.api.delete(`${server}/shop/delete-seller/${id}`, true); this.toast.success(res.message); }
    catch (error) { this.toast.error(this.api.message(error)); }
    this.sellerStore.getAllSellers();
  }
}

@Component({
  selector: 'app-all-products-admin',
  standalone: true,
  imports: [DataTableComponent],
  template: `<div class="w-full mx-8 pt-1 mt-10 bg-white"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" /></div>`,
})
export class AllProductsAdminComponent implements OnInit {
  private api = inject(ApiService);
  data = signal<any[]>([]);
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Product Id', minWidth: 150, flex: 0.7 },
    { field: 'name', headerName: 'Name', minWidth: 180, flex: 1.4 },
    { field: 'price', headerName: 'Price', minWidth: 100, flex: 0.6 },
    { field: 'Stock', headerName: 'Stock', type: 'number', minWidth: 80, flex: 0.5 },
    { field: 'sold', headerName: 'Sold out', type: 'number', minWidth: 130, flex: 0.6 },
    { field: 'Preview', headerName: '', flex: 0.8, minWidth: 100, linkPrefix: '/product', icon: 'AiOutlineEye' },
  ];
  row = () => (this.data() || []).map((item) => ({ id: item._id, name: item.name, price: 'US$ ' + item.discountPrice, Stock: item.stock, sold: item?.sold_out }));
  async ngOnInit() { try { const res: any = await this.api.get(`${server}/product/admin-all-products`, true); this.data.set(res.products); } catch (e) { console.log(e); } }
}

@Component({
  selector: 'app-all-events-admin',
  standalone: true,
  imports: [DataTableComponent],
  template: `<div class="w-full mx-8 pt-1 mt-10 bg-white"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" /></div>`,
})
export class AllEventsAdminComponent implements OnInit {
  private api = inject(ApiService);
  events = signal<any[]>([]);
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Product Id', minWidth: 150, flex: 0.7 },
    { field: 'name', headerName: 'Name', minWidth: 180, flex: 1.4 },
    { field: 'price', headerName: 'Price', minWidth: 100, flex: 0.6 },
    { field: 'Stock', headerName: 'Stock', type: 'number', minWidth: 80, flex: 0.5 },
    { field: 'sold', headerName: 'Sold out', type: 'number', minWidth: 130, flex: 0.6 },
    { field: 'Preview', headerName: '', flex: 0.8, minWidth: 100, linkPrefix: '/product', icon: 'AiOutlineEye', linkQueryParams: { isEvent: 'true' } },
  ];
  row = () => (this.events() || []).map((item) => ({ id: item._id, name: item.name, price: 'US$ ' + item.discountPrice, Stock: item.stock, sold: item.sold_out }));
  async ngOnInit() { try { const res: any = await this.api.get(`${server}/event/admin-all-events`, true); this.events.set(res.events); } catch (e) { console.log(e); } }
}

@Component({
  selector: 'app-all-withdraw',
  standalone: true,
  imports: [IconComponent, DataTableComponent],
  template: `<div class="w-full flex items-center pt-5 justify-center">
    <div class="w-[95%] bg-white"><app-data-table [rows]="row()" [columns]="columns" [pageSize]="10" (cellAction)="onCellAction($event)" /></div>
    @if (open()) {
      <div class="w-full fixed h-screen top-0 left-0 bg-[#00000031] z-[9999] flex items-center justify-center">
        <div class="w-[50%] min-h-[40vh] bg-white rounded shadow p-4">
          <div class="flex justify-end w-full"><app-icon name="RxCross1" [size]="25" (click)="open.set(false)" /></div>
          <h1 class="text-[25px] text-center font-Poppins">Update Withdraw status</h1><br />
          <select (change)="withdrawStatus.set($any($event.target).value)" class="w-[200px] h-[35px] border rounded">
            <option [value]="withdrawData()?.status">{{ withdrawData()?.status }}</option>
            <option value="Succeed">Succeed</option>
          </select>
          <button type="submit" class="block {{ styles.button }} text-white !h-[42px] mt-4 text-[18px]" (click)="handleSubmit()">Update</button>
        </div>
      </div>
    }
  </div>`,
})
export class AllWithdrawComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  styles = styles;
  data = signal<any[]>([]);
  open = signal(false);
  withdrawData = signal<any>(null);
  withdrawStatus = signal('Processing');
  columns: GridColumn[] = [
    { field: 'id', headerName: 'Withdraw Id', minWidth: 150, flex: 0.7 },
    { field: 'name', headerName: 'Shop Name', minWidth: 180, flex: 1.4 },
    { field: 'shopId', headerName: 'Shop Id', minWidth: 180, flex: 1.4 },
    { field: 'amount', headerName: 'Amount', minWidth: 100, flex: 0.6 },
    { field: 'status', headerName: 'status', minWidth: 80, flex: 0.5 },
    { field: 'createdAt', headerName: 'Request given at', minWidth: 130, flex: 0.6 },
    { field: ' ', headerName: 'Update Status', minWidth: 130, flex: 0.6, actionIcon: 'BsPencil', hidden: (row: any) => row.status !== 'Processing' },
  ];
  row = () => (this.data() || []).map((item) => ({
    id: item._id, shopId: item.seller?._id, name: item.seller?.name,
    amount: 'US$ ' + item.amount, status: item.status, createdAt: item.createdAt?.slice(0, 10),
  }));
  async ngOnInit() { try { const res: any = await this.api.get(`${server}/withdraw/get-all-withdraw-request`, true); this.data.set(res.withdraws); } catch (e) { console.log(e); } }
  onCellAction(e: any) { if (e.row.status !== 'Processing') return; this.withdrawData.set(e.row); this.open.set(true); }
  async handleSubmit() {
    const w = this.withdrawData();
    const res: any = await this.api.put(`${server}/withdraw/update-withdraw-request/${w.id}`, { sellerId: w.shopId }, true);
    this.toast.success('Withdraw request updated successfully!');
    this.data.set(res.withdraws);
    this.open.set(false);
  }
}
