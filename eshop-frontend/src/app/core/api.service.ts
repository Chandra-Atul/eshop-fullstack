import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);
  private options(withCredentials: boolean) {
    return { withCredentials, headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  }
  get<T = any>(url: string, withCredentials = false): Promise<T> { return firstValueFrom(this.http.get<T>(url, this.options(withCredentials))); }
  post<T = any>(url: string, body: any = {}, withCredentials = false): Promise<T> { return firstValueFrom(this.http.post<T>(url, body, this.options(withCredentials))); }
  put<T = any>(url: string, body: any = {}, withCredentials = false): Promise<T> { return firstValueFrom(this.http.put<T>(url, body, this.options(withCredentials))); }
  delete<T = any>(url: string, withCredentials = false): Promise<T> { return firstValueFrom(this.http.delete<T>(url, this.options(withCredentials))); }
  message(error: any): string { return error?.error?.message || error?.error?.error || error?.message || 'Something went wrong!'; }
}
