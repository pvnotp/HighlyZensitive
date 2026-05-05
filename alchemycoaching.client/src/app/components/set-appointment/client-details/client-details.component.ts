import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { SetAppointmentActions } from '../store/set-appointment.actions';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss'
})
export class ClientDetailsComponent {
  private readonly store = inject(Store);
  private readonly formBuilder = inject(FormBuilder);

  readonly form = this.formBuilder.group({
    name: ['', [Validators.required]],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern(/^\(\d{3}\) \d{3}-\d{4}$/)]],
  });

  onFormChanged(): void {
    const { name, email, phone } = this.form.getRawValue();
    const trimmedName = (name ?? '').trim();
    const trimmedEmail = (email ?? '').trim();
    const trimmedPhone = (phone ?? '').trim();

    if (this.form.valid && trimmedName) {
      this.store.dispatch(
        SetAppointmentActions.setClientDetails({
          clientDetails: { name: trimmedName, email: trimmedEmail, phone: trimmedPhone },
        }),
      );
    } else {
      this.store.dispatch(SetAppointmentActions.clearDetails());
    }
  }

  onPhoneChanged(phoneValue: string): void {
    const formattedPhone = this.formatPhoneNumber(phoneValue);
    this.form.controls.phone.setValue(formattedPhone, { emitEvent: false });
    this.onFormChanged();
  }

  private formatPhoneNumber(value: string): string {
    let digits = value.replace(/\D/g, '');
  
    if (digits.startsWith('1')) {
      digits = digits.slice(1);
    }
    digits = digits.slice(0, 10);
    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }

}
