import { AfterViewChecked, Component, ElementRef, Input, OnDestroy, OnInit, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconComponent } from '../../core/icon.component';
import { styles } from '../../styles';
import { ApiService } from '../../core/api.service';
import { SocketService } from '../../core/socket.service';
import { SellerStore, UserStore } from '../../core/state';
import { server } from '../../config';
import { format } from '../../shared/timeago';
import { HeaderComponent } from '../layout/header.component';

@Component({
  selector: 'app-inbox',
  standalone: true,
  imports: [FormsModule, IconComponent, HeaderComponent],
  template: `@if (mode === 'user' && !open()) { <app-header /> }
    <div [class]="mode === 'user' ? 'w-full' : 'w-[90%] bg-white m-5 h-[85vh] overflow-y-scroll rounded'">
      @if (!open()) {
        <h1 class="text-center text-[30px] py-3 font-Poppins">All Messages</h1>
        @for (item of conversations(); track item._id; let index = $index) {
          <div class="w-full flex p-3 px-3 {{ activeIndex() === index ? 'bg-[#00000010]' : 'bg-transparent' }} cursor-pointer" (click)="openChat(item, index)">
            <div class="relative">
              <img [src]="peers()[item._id]?.avatar?.url" alt="" class="w-[50px] h-[50px] rounded-full" />
              @if (onlineCheck(item)) { <div class="w-[12px] h-[12px] bg-green-400 rounded-full absolute top-[2px] right-[2px]"></div> }
              @else { <div class="w-[12px] h-[12px] bg-[#c7b9b9] rounded-full absolute top-[2px] right-[2px]"></div> }
            </div>
            <div class="pl-3"><h1 class="text-[18px]">{{ peers()[item._id]?.name }}</h1>
              <p class="text-[16px] text-[#000c]">{{ lastMessagePrefix(item) }} {{ item?.lastMessage }}</p></div>
          </div>
        }
      } @else {
        <div class="w-full min-h-full flex flex-col justify-between p-5">
          <div class="w-full flex p-3 items-center justify-between bg-slate-200">
            <div class="flex"><img [src]="userData()?.avatar?.url" alt="" class="w-[60px] h-[60px] rounded-full" />
              <div class="pl-3"><h1 class="text-[18px] font-[600]">{{ userData()?.name }}</h1><h1>{{ activeStatus() ? 'Active Now' : '' }}</h1></div></div>
            <app-icon name="AiOutlineArrowRight" [size]="20" class="cursor-pointer" (click)="open.set(false)" />
          </div>
          <div class="px-3 h-[65vh] py-3 overflow-y-scroll">
            @for (item of messages(); track $index) {
              <div class="flex w-full my-2 {{ item.sender === myId() ? 'justify-end' : 'justify-start' }}">
                @if (item.sender !== myId()) { <img [src]="userData()?.avatar?.url" class="w-[40px] h-[40px] rounded-full mr-3" alt="" /> }
                @if (item.images) { <img [src]="item.images?.url" class="w-[300px] h-[300px] object-cover rounded-[10px] mr-2" /> }
                @if (item.text !== '') {
                  <div><div class="w-max p-2 rounded {{ item.sender === myId() ? 'bg-[#000]' : 'bg-[#38c776]' }} text-[#fff] h-min"><p>{{ item.text }}</p></div>
                    <p class="text-[12px] text-[#000000d3] pt-1">{{ formatTime(item.createdAt) }}</p></div>
                }
              </div>
            }
            <div #scrollRef></div>
          </div>
          <form class="p-3 relative w-full flex justify-between items-center" (ngSubmit)="sendMessageHandler($event)">
            <div class="w-[30px]"><input type="file" id="inbox-image" class="hidden" (change)="handleImageUpload($event)" />
              <label for="inbox-image"><app-icon name="TfiGallery" [size]="20" class="cursor-pointer" /></label></div>
            <div class="w-full">
              <input type="text" required placeholder="Enter your message..." [ngModel]="newMessage()" (ngModelChange)="newMessage.set($event)" name="newMessage" class="{{ styles.input }}" />
              <input type="submit" value="Send" class="hidden" id="send" /><label for="send"><app-icon name="AiOutlineSend" [size]="20" class="absolute right-4 top-5 cursor-pointer" /></label>
            </div>
          </form>
        </div>
      }
    </div>`,
})
export class InboxComponent implements OnInit, OnDestroy, AfterViewChecked {
  private api = inject(ApiService);
  private socketService = inject(SocketService);
  private sellerStore = inject(SellerStore);
  private userStore = inject(UserStore);
  @Input() mode: 'user' | 'seller' = 'seller';
  @ViewChild('scrollRef') scrollRef?: ElementRef<HTMLDivElement>;
  styles = styles;
  conversations = signal<any[]>([]);
  messages = signal<any[]>([]);
  currentChat = signal<any>(null);
  userData = signal<any>(null);
  newMessage = signal('');
  onlineUsers = signal<any[]>([]);
  activeStatus = signal(false);
  open = signal(false);
  activeIndex = signal(0);
  peers = signal<Record<string, any>>({});
  private socket = this.socketService.socket;
  private handlers: { event: string; fn: any }[] = [];
  myId = computed(() => (this.mode === 'seller' ? this.sellerStore.seller()?._id : this.userStore.user()?._id));
  async ngOnInit() {
    const onMessage = (data: any) => {
      const chat = this.currentChat();
      if (chat && chat.members.includes(data.senderId)) {
        this.messages.update((prev) => [...prev, { sender: data.senderId, text: data.text, createdAt: Date.now() }]);
      }
    };
    this.socket.on('getMessage', onMessage); this.handlers.push({ event: 'getMessage', fn: onMessage });
    const onUsers = (data: any) => this.onlineUsers.set(data);
    this.socket.on('getUsers', onUsers); this.handlers.push({ event: 'getUsers', fn: onUsers });
    await this.getConversation();
    const id = this.myId(); if (id) this.socket.emit('addUser', id);
  }
  ngAfterViewChecked() { try { this.scrollRef?.nativeElement.scrollIntoView({ behavior: 'smooth' }); } catch {} }
  ngOnDestroy() { this.handlers.forEach((h) => this.socket.off(h.event, h.fn)); }
  formatTime(date: any) { return format(date); }
  async getConversation() {
    const id = this.myId(); if (!id) return;
    const url = this.mode === 'seller' ? `${server}/conversation/get-all-conversation-seller/${id}` : `${server}/conversation/get-all-conversation-user/${id}`;
    try { const response: any = await this.api.get(url, true); this.conversations.set(response.conversations); await this.loadPeers(); } catch {}
  }
  private async loadPeers() {
    const me = this.myId();
    const map: Record<string, any> = { ...this.peers() };
    for (const chat of this.conversations()) {
      const peerId = chat.members.find((m: string) => m !== me);
      if (!peerId || map[chat._id]) continue;
      try {
        const res: any = this.mode === 'user' ? await this.api.get(`${server}/shop/get-shop-info/${peerId}`) : await this.api.get(`${server}/user/user-info/${peerId}`);
        map[chat._id] = this.mode === 'user' ? res.shop : res.user;
      } catch {}
    }
    this.peers.set(map);
  }
  onlineCheck(chat: any) {
    const me = this.myId();
    const member = chat.members.find((m: string) => m !== me);
    return !!this.onlineUsers().find((u: any) => u.userId === member);
  }
  lastMessagePrefix(item: any) {
    const loading = this.mode === 'seller' ? this.sellerStore.isLoading() : this.userStore.loading();
    const peer = this.peers()[item._id];
    if (!loading && item?.lastMessageId !== peer?._id) return 'You:';
    return peer?.name ? peer.name.split(' ')[0] + ':' : '';
  }
  async openChat(chat: any, index: number) {
    this.activeIndex.set(index); this.open.set(true); this.currentChat.set(chat);
    this.userData.set(this.peers()[chat._id]); this.activeStatus.set(this.onlineCheck(chat));
    try { const response: any = await this.api.get(`${server}/message/get-all-messages/${chat._id}`); this.messages.set(response.messages); } catch (e) { console.log(e); }
  }
  async sendMessageHandler(e: Event) {
    e.preventDefault();
    const chat = this.currentChat(); const me = this.myId();
    const receiverId = chat.members.find((m: string) => m !== me);
    this.socket.emit('sendMessage', { senderId: me, receiverId, text: this.newMessage() });
    if (this.newMessage() !== '') {
      try {
        const res: any = await this.api.post(`${server}/message/create-new-message`, { sender: me, text: this.newMessage(), conversationId: chat._id });
        this.messages.update((prev) => [...prev, res.message]);
        await this.updateLastMessage();
      } catch (e) { console.log(e); }
    }
  }
  async updateLastMessage() {
    const me = this.myId(); const chat = this.currentChat();
    this.socket.emit('updateLastMessage', { lastMessage: this.newMessage(), lastMessageId: me });
    try {
      await this.api.put(`${server}/conversation/update-last-message/${chat._id}`, { lastMessage: this.newMessage(), lastMessageId: me });
      this.newMessage.set(''); await this.getConversation();
    } catch (e) { console.log(e); }
  }
  async handleImageUpload(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]; if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { if (reader.readyState === 2) this.imageSendingHandler(reader.result as string); };
    reader.readAsDataURL(file);
  }
  async imageSendingHandler(image: any) {
    const chat = this.currentChat(); const me = this.myId();
    const receiverId = chat.members.find((m: string) => m !== me);
    this.socket.emit('sendMessage', { senderId: me, receiverId, images: image });
    try {
      const res: any = await this.api.post(`${server}/message/create-new-message`, { images: image, sender: me, text: this.newMessage(), conversationId: chat._id });
      this.messages.update((prev) => [...prev, res.message]);
      await this.api.put(`${server}/conversation/update-last-message/${chat._id}`, { lastMessage: 'Photo', lastMessageId: me });
    } catch (e) { console.log(e); }
  }
}
