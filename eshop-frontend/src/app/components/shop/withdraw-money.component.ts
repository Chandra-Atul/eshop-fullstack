import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { ApiService } from '../../core/api.service';
import { ToastService } from '../../core/toast.service';
import { OrderStore, SellerStore } from '../../core/state';
import { server } from '../../config';

@Component({
  selector: 'app-withdraw-money',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `<div class="w-full h-[90vh] p-8">
    <div class="w-full bg-white h-full rounded flex items-center justify-center flex-col">
      <h5 class="text-[20px] pb-4">Available Balance: &#36;{{ availableBalance() }}</h5>
      <div class="{{ styles.button }} text-white !h-[42px] !rounded" (click)="onWithdrawClick()">Withdraw</div>
    </div>
    @if (open()) {
      <div class="w-full h-screen z-[9999] fixed top-0 left-0 flex items-center justify-center bg-[#0000004e]">
        <div class="w-[95%] 800px:w-[50%] bg-white shadow rounded {{ paymentMethod() ? 'h-[80vh] overflow-y-scroll' : 'h-[unset]' }} min-h-[40vh] p-3">
          <div class="w-full flex justify-end"><app-icon name="RxCross1" [size]="25" class="cursor-pointer" (click)="open.set(false); paymentMethod.set(false)" /></div>
          @if (paymentMethod()) {
            <div><h3 class="text-[22px] font-Poppins text-center font-[600]">Add new Withdraw Method:</h3>
              <form (ngSubmit)="handleSubmit($event)">
                <div class="pt-2"><label>Bank Name <span class="text-red-500">*</span></label>
                  <input type="text" required [ngModel]="bankInfo().bankName" (ngModelChange)="updateBankInfo('bankName', $event)" name="bankName" placeholder="Enter your Bank name!" class="{{ styles.input }} mt-2" /></div>
                <div class="pt-2"><label>Bank Country <span class="text-red-500">*</span></label>
                  <input type="text" required [ngModel]="bankInfo().bankCountry" (ngModelChange)="updateBankInfo('bankCountry', $event)" name="bankCountry" placeholder="Enter your bank Country!" class="{{ styles.input }} mt-2" /></div>
                <div class="pt-2"><label>Bank Swift Code <span class="text-red-500">*</span></label>
                  <input type="text" required [ngModel]="bankInfo().bankSwiftCode" (ngModelChange)="updateBankInfo('bankSwiftCode', $event)" name="bankSwiftCode" placeholder="Enter your Bank Swift Code!" class="{{ styles.input }} mt-2" /></div>
                <div class="pt-2"><label>Bank Account Number <span class="text-red-500">*</span></label>
                  <input type="number" required [ngModel]="bankInfo().bankAccountNumber" (ngModelChange)="updateBankInfo('bankAccountNumber', $event)" name="bankAccountNumber" placeholder="Enter your bank account number!" class="{{ styles.input }} mt-2" /></div>
                <div class="pt-2"><label>Bank Holder Name <span class="text-red-500">*</span></label>
                  <input type="text" required [ngModel]="bankInfo().bankHolderName" (ngModelChange)="updateBankInfo('bankHolderName', $event)" name="bankHolderName" placeholder="Enter your bank Holder name!" class="{{ styles.input }} mt-2" /></div>
                <div class="pt-2"><label>Bank Address <span class="text-red-500">*</span></label>
                  <input type="text" required [ngModel]="bankInfo().bankAddress" (ngModelChange)="updateBankInfo('bankAddress', $event)" name="bankAddress" placeholder="Enter your bank address!" class="{{ styles.input }} mt-2" /></div>
                <button type="submit" class="{{ styles.button }} mb-3 text-white">Add</button>
              </form>
            </div>
          } @else {
            <h3 class="text-[22px] font-Poppins">Available Withdraw Methods:</h3>
            @if (seller()?.withdrawMethod) {
              <div>
                <div class="800px:flex w-full justify-between items-center">
                  <div class="800px:w-[50%]">
                    <h5>Account Number: {{ maskedAccountNumber }}</h5>
                    <h5>Bank Name: {{ seller()?.withdrawMethod?.bankName }}</h5></div>
                  <div class="800px:w-[50%]"><app-icon name="AiOutlineDelete" [size]="25" class="cursor-pointer" (click)="deleteHandler()" /></div>
                </div><br />
                <h4>Available Balance: {{ availableBalance() }}&#36;</h4><br />
                <div class="800px:flex w-full items-center">
                  <input type="number" placeholder="Amount..." [ngModel]="withdrawAmount()" (ngModelChange)="withdrawAmount.set($event)" name="amount" class="800px:w-[100px] w-full border 800px:mr-3 p-1 rounded" />
                  <div class="{{ styles.button }} !h-[42px] text-white" (click)="withdrawHandler()">Withdraw</div></div>
              </div>
            } @else {
              <div><p class="text-[18px] pt-2">No Withdraw Methods available!</p>
                <div class="w-full flex items-center"><div class="{{ styles.button }} text-[#fff] text-[18px] mt-4" (click)="paymentMethod.set(true)">Add new</div></div></div>
            }
          }
        </div>
      </div>
    }
  </div>`,
})
export class WithdrawMoneyComponent implements OnInit {
  private api = inject(ApiService);
  private toast = inject(ToastService);
  private sellerStore = inject(SellerStore);
  private orderStore = inject(OrderStore);
  styles = styles;
  open = signal(false);
  paymentMethod = signal(false);
  withdrawAmount = signal<any>(50);
  seller = this.sellerStore.seller;
  availableBalance = computed(() => (this.sellerStore.seller()?.availableBalance ?? 0).toFixed(2));
  bankInfo = signal({ bankName: '', bankCountry: '', bankSwiftCode: null as any, bankAccountNumber: null as any, bankHolderName: '', bankAddress: '' });
  get maskedAccountNumber() {
    const n = this.seller()?.withdrawMethod?.bankAccountNumber || '';
    return '*'.repeat(Math.max(0, n.length - 3)) + n.slice(-3);
  }
  ngOnInit() { const s = this.sellerStore.seller(); if (s) this.orderStore.getAllOrdersOfShop(s._id); }
  updateBankInfo(field: string, value: any) { this.bankInfo.update((i) => ({ ...i, [field]: value })); }
  onWithdrawClick() { if (Number(this.availableBalance()) < 50) this.error(); else this.open.set(true); }
  async handleSubmit(e: Event) {
    e.preventDefault();
    const i = this.bankInfo();
    this.paymentMethod.set(false);
    try {
      await this.api.put(`${server}/shop/update-payment-methods`, { withdrawMethod: { bankName: i.bankName, bankCountry: i.bankCountry, bankSwiftCode: i.bankSwiftCode, bankAccountNumber: i.bankAccountNumber, bankHolderName: i.bankHolderName, bankAddress: i.bankAddress } }, true);
      this.toast.success('Withdraw method added successfully!');
      this.sellerStore.loadSeller();
      this.bankInfo.set({ bankName: '', bankCountry: '', bankSwiftCode: null, bankAccountNumber: null, bankHolderName: '', bankAddress: '' });
    } catch (error) { console.log(this.api.message(error)); }
  }
  async deleteHandler() {
    await this.api.delete(`${server}/shop/delete-withdraw-method`, true);
    this.toast.success('Withdraw method deleted successfully!');
    this.sellerStore.loadSeller();
  }
  error() { this.toast.error('You not have enough balance to withdraw!'); }
  async withdrawHandler() {
    const availableBalance = Number(this.availableBalance());
    if (this.withdrawAmount() < 50 || this.withdrawAmount() > availableBalance) { this.toast.error("You can't withdraw this amount!"); }
    else {
      await this.api.post(`${server}/withdraw/create-withdraw-request`, { amount: this.withdrawAmount() }, true);
      this.toast.success('Withdraw money request is successful!');
    }
  }
}
