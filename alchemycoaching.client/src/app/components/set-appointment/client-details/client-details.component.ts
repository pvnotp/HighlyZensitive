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
}
