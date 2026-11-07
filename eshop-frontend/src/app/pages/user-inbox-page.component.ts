import { Component } from '@angular/core';
import { InboxComponent } from '../components/shop/inbox.component';

@Component({ selector: 'app-user-inbox-page', standalone: true, imports: [InboxComponent], template: `<app-inbox mode="user" />` })
export class UserInboxPageComponent {}
