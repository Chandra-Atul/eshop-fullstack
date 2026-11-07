import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiService } from '../core/api.service';
import { server } from '../config';

@Component({ selector: 'app-activation-page', standalone: true,
  template: `<div style="width:100%;height:100vh;display:flex;justify-content:center;align-items:center;">
    @if (error()) { <p>Your token is expired!</p> } @else { <p>Your account has been created suceessfully!</p> }</div>` })
export class ActivationPageComponent implements OnInit {
  private route = inject(ActivatedRoute); private api = inject(ApiService);
  error = signal(false);
  async ngOnInit() {
    const activation_token = this.route.snapshot.paramMap.get('activation_token');
    if (activation_token) { try { await this.api.post(`${server}/user/activation`, { activation_token }); } catch { this.error.set(true); } }
  }
}
