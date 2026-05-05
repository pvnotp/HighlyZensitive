import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Store } from '@ngrx/store';
import { SetAppointmentActions } from '../store/set-appointment.actions';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss'
})
export class ClientDetailsComponent {
  private readonly store = inject(Store);

  form = { name: '', email: '', phone: '' };

  onFormChanged(): void {
    const { name, email, phone } = this.form;
    if (name.trim() && email.trim() && phone.trim()) {
      this.store.dispatch(
        SetAppointmentActions.setClientDetails({
          clientDetails: { name: name.trim(), email: email.trim(), phone: phone.trim() },
        }),
      );
    } else {
      this.store.dispatch(SetAppointmentActions.clearDetails());
    }
  }

  onPhoneChanged(phoneValue: string): void {
    this.form.phone = this.formatPhoneNumber(phoneValue);
    this.onFormChanged();
  }

  private formatPhoneNumber(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 10);
    if (digits.length <= 3) {
      return digits;
    }
    if (digits.length <= 6) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    }
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  }
}
