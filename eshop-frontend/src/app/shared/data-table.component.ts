import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../core/icon.component';

export interface GridColumn {
  field: string; headerName?: string; minWidth?: number; flex?: number; type?: string; sortable?: boolean;
  statusColor?: boolean; linkPrefix?: string; icon?: string; actionIcon?: string; linkQueryParams?: any;
  hidden?: (row: any) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [RouterLink, IconComponent],
  template: `
    <div class="w-full overflow-x-auto bg-white">
      <table class="w-full text-[15px] border-collapse">
        <thead><tr class="border-b">
          @for (col of columns; track col.field) { <th class="text-left font-[600] py-3 px-4 text-[#000000ba]" [style.min-width.px]="col.minWidth || 100">{{ col.headerName || '' }}</th> }
        </tr></thead>
        <tbody>
          @for (row of pageRows(); track row['id'] ?? $index) {
            <tr class="border-b hover:bg-[#f5f5f5]">
              @for (col of columns; track col.field) {
                <td class="py-3 px-4" [style.min-width.px]="col.minWidth || 100">
                  @if (col.linkPrefix) {
                    <a [routerLink]="[col.linkPrefix, row['id']]" [queryParams]="col.linkQueryParams || {}">
                      <app-icon [name]="col.icon || 'AiOutlineArrowRight'" [size]="20" class="cursor-pointer" /></a>
                  } @else if (col.actionIcon) {
                    <app-icon [name]="col.actionIcon" [size]="20" class="cursor-pointer"
                      [class.hidden]="col.hidden ? col.hidden(row) : false" (click)="cellAction.emit({ field: col.field, row: row })" />
                  } @else if (col.statusColor) {
                    <span [class]="row[col.field] === 'Delivered' ? 'text-[green]' : 'text-[red]'">{{ row[col.field] }}</span>
                  } @else { {{ row[col.field] }} }
                </td>
              }
            </tr>
          }
          @if (rows.length === 0) { <tr><td class="py-6 px-4 text-center text-[#00000082]" [attr.colspan]="columns.length">No rows</td></tr> }
        </tbody>
      </table>
      <div class="flex items-center justify-end gap-3 p-2 text-[13px] text-[#00000082]">
        <span>Page {{ page() + 1 }} of {{ totalPages() }}</span>
        <button class="px-2 py-1 border rounded disabled:opacity-40" [disabled]="page() === 0" (click)="prev()">Prev</button>
        <button class="px-2 py-1 border rounded disabled:opacity-40" [disabled]="page() >= totalPages() - 1" (click)="next()">Next</button>
      </div>
    </div>`,
})
export class DataTableComponent {
  @Input() columns: GridColumn[] = [];
  @Input() pageSize = 10;
  @Output() cellAction = new EventEmitter<{ field: string; row: any }>();
  page = signal(0);
  private _rows: any[] = [];
  @Input() set rows(value: any[]) { this._rows = value || []; this.page.set(0); }
  get rows() { return this._rows; }
  totalPages = computed(() => Math.max(1, Math.ceil(this._rows.length / this.pageSize)));
  pageRows = computed(() => { const start = this.page() * this.pageSize; return this._rows.slice(start, start + this.pageSize); });
  next() { if (this.page() < this.totalPages() - 1) this.page.set(this.page() + 1); }
  prev() { if (this.page() > 0) this.page.set(this.page() - 1); }
}
