import { Component, ViewChild } from '@angular/core';
import { ReplaySubject, takeUntil } from 'rxjs';
import { UserService } from './user.service';
import { MatDialog } from '@angular/material/dialog';
import { UpserUserDialogComponent } from './upser-user-dialog.component';
import { MatTable } from '@angular/material/table';
import { ReactiveDataSource } from './reactive-data-source';

export interface IUser {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
}

/**
 * @title user list with action buttons
 */
@Component({
  selector: 'app-user-list',
  styleUrls: ['user-list.component.css'],
  templateUrl: 'user-list.component.html',
  providers: [UserService],
})
export class UserListComponent {
  @ViewChild(MatTable) table: MatTable<IUser>;

  displayedColumns: string[] = ['name', 'weight', 'symbol', 'star'];

  dataSource = new ReactiveDataSource(this.userService.latestUsers$);

  private destroy$$ = new ReplaySubject<void>();

  constructor(protected userService: UserService, public dialog: MatDialog) {}

  ngAfterViewInit() {
    this.table.contentChanged
      .pipe(takeUntil(this.destroy$$))
      .subscribe(() => this.table.updateStickyColumnStyles());
  }

  openDialog(action = 'add', currentValue?: IUser) {
    this.dialog.open(UpserUserDialogComponent, {
      data: {
        action,
        actions: {
          add: (value: IUser) => this.userService.addUserAction$$.next(value),
          edit: (value: IUser) =>
            this.userService.updateUserAction$$.next(value),
        },
        currentValue,
      },
    });
  }

  ngOnDestroy(): void {
    this.destroy$$.next();
    this.destroy$$.complete();
  }
}
