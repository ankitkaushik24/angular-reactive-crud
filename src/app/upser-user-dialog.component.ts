import { Component, Inject, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-upser-user-dialog',
  template: `
  <header>
  <h3 mat-dialog-title>{{ action === 'edit' ? 'Edit User' : 'New User' }}</h3>
</header>

<div mat-dialog-content>
  <form [formGroup]="form">
  <mat-form-field>
        <input
        matInput
        placeholder="First name"
        formControlName="firstName" /></mat-form-field>

        <mat-form-field>
        <input
        matInput
        placeholder="Last name"
        formControlName="lastName" /></mat-form-field>

        <mat-form-field>
        <input
        matInput
        placeholder="Email"
        formControlName="email" />
        </mat-form-field>
  </form>
</div>

<footer mat-dialog-actions align="end">
  <button type="reset" matDialogClose mat-raised-button color="secondary">Cancel</button>
  <button mat-raised-button color="primary"
    (click)="upsert()"
  >
    {{ action === 'edit' ? 'Save' : 'Create' }}
  </button>
</footer>
  `,
  styles: [],
})
export class UpserUserDialogComponent {
  form = inject(FormBuilder).nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', Validators.required],
  });

  action = this.data.action;

  constructor(
    @Inject(MAT_DIALOG_DATA) private data: any,
    private dialogRef: MatDialogRef<any>
  ) {}

  ngOnInit() {
    if (this.data.action === 'edit') {
      this.form.patchValue(this.data.currentValue);
    }
  }

  upsert() {
    if (this.form.invalid) return;

    this.data.actions[this.action]({
      ...this.data.currentValue,
      ...this.form.getRawValue(),
    });

    this.dialogRef.close();
  }
}
