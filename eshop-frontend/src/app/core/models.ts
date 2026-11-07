export interface ImageRef { public_id?: string; url: string; }
export interface Address { _id?: string; country: string; city: string; address1: string; address2?: string; zipCode: string; addressType: string; }
export interface Shop { _id: string; name: string; email?: string; description?: string; address?: string; phoneNumber?: any; role?: string; avatar?: ImageRef; zipCode?: any; availableBalance?: number; withdrawMethod?: any; transactions?: any[]; ratings?: number; createdAt?: string; }
export interface Product { _id: string; name: string; description: string; category: string; tags?: string; originalPrice: number; discountPrice: number; stock: number; shop: Shop; images: ImageRef[]; ratings?: number; reviews?: any[]; sold_out?: number; createdAt?: string; isReviewed?: boolean; }
export interface CartItem extends Product { qty: number; }
export interface User { _id: string; name: string; email: string; phoneNumber?: any; role?: string; avatar?: ImageRef; addresses?: Address[]; createdAt?: string; }
export interface EventModel { _id: string; name: string; description: string; category: string; start_Date: string; Finish_Date: string; status?: string; tags?: string; originalPrice?: number; discountPrice?: number; stock: number; images: ImageRef[]; shop: Shop; sold_out?: number; }
export interface Order { _id: string; cart: CartItem[]; shippingAddress: Address; user: User; totalPrice: number; status: string; paymentInfo?: any; createdAt: string; paidAt?: number; deliveredAt?: number; }
export interface Conversation { _id: string; members: string[]; lastMessage?: string; lastMessageId?: string; time?: string; }
export interface Message { _id: string; conversationId: string; text?: string; sender: string; images?: ImageRef; createdAt?: string; }
