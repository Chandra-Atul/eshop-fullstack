import { Component, EventEmitter, Input, Output, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../core/icon.component';

export interface GridColumn {
  field: string;
  headerName?: string;
  minWidth?: number;
  flex?: number;
  type?: string;
  sortable?: boolean;
  statusColor?: boolean;
  linkPrefix?: string;
  icon?: string;
  actionIcon?: string;
  linkQueryParams?: any;
  hidden?: (row: any) => boolean;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [CommonModule, RouterLink, IconComponent],
  host: {
    class: 'w-full block',
  },
  template: `
    <div class="w-full overflow-x-auto bg-white rounded-lg shadow-sm border border-gray-100">
      <table class="w-full text-[15px] border-collapse">
        <thead>
          <tr class="border-b bg-gray-50">
            @for (col of columns; track col.field) {
              <th
                class="text-left font-[600] py-3 px-4 text-[#000000ba]"
                [style.min-width.px]="col.minWidth || 100"
              >
                {{ col.headerName || '' }}
              </th>
            }
          </tr>
        </thead>
        <tbody>
          @for (row of pageRows(); track row['id'] ?? $index) {
            <tr class="border-b hover:bg-[#f9fafb] transition-colors">
              @for (col of columns; track col.field) {
                <td class="py-3 px-4" [style.min-width.px]="col.minWidth || 100">
                  @if (col.linkPrefix) {
                    <a [routerLink]="[col.linkPrefix, row['id']]" [queryParams]="col.linkQueryParams || {}">
                      <app-icon [name]="col.icon || 'AiOutlineArrowRight'" [size]="20" class="cursor-pointer text-blue-600 hover:text-blue-800" />
                    </a>
                  } @else if (col.actionIcon) {
                    <app-icon
                      [name]="col.actionIcon"
                      [size]="20"
                      class="cursor-pointer text-red-600 hover:text-red-800"
                      [class.hidden]="col.hidden ? col.hidden(row) : false"
                      (click)="cellAction.emit({ field: col.field, row: row })"
                    />
                  } @else if (col.statusColor) {
                    <span [class]="row[col.field] === 'Delivered' ? 'text-green-600 font-medium' : 'text-red-500 font-medium'">
                      {{ row[col.field] }}
                    </span>
                  } @else {
                    {{ row[col.field] ?? '-' }}
                  }
                </td>
              }
            </tr>
          }
          @if (rowsData().length === 0) {
            <tr>
              <td class="py-8 px-4 text-center text-gray-400 text-sm" [attr.colspan]="columns.length">
                No products found
              </td>
            </tr>
          }
        </tbody>
      </table>

      <div class="flex items-center justify-end gap-3 p-3 text-[13px] text-gray-500 border-t border-gray-100">
        <span>Page {{ page() + 1 }} of {{ totalPages() }}</span>
        <button
          class="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          [disabled]="page() === 0"
          (click)="prev()"
        >
          Prev
        </button>
        <button
          class="px-3 py-1 border border-gray-300 rounded bg-white hover:bg-gray-50 disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          [disabled]="page() >= totalPages() - 1"
          (click)="next()"
        >
          Next
        </button>
      </div>
    </div>
  `,
})
export class DataTableComponent {
  @Input() columns: GridColumn[] = [];
  @Input() pageSize = 10;
  @Output() cellAction = new EventEmitter<{ field: string; row: any }>();

  page = signal(0);
  rowsData = signal<any[]>([]);

  @Input() set rows(value: any[]) {
    this.rowsData.set(value || []);
    this.page.set(0);
  }

  totalPages = computed(() => Math.max(1, Math.ceil(this.rowsData().length / this.pageSize)));

  pageRows = computed(() => {
    const start = this.page() * this.pageSize;
    return this.rowsData().slice(start, start + this.pageSize);
  });

  next() {
    if (this.page() < this.totalPages() - 1) {
      this.page.update((p) => p + 1);
    }
  }

  prev() {
    if (this.page() > 0) {
      this.page.update((p) => p - 1);
    }
  }
}