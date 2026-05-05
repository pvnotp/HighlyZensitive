import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-client-details',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './client-details.component.html',
  styleUrl: './client-details.component.scss'
})
export class ClientDetailsComponent {
  @Input() contactName = '';
  @Input() contactEmail = '';
  @Input() contactPhone = '';

  @Output() readonly contactNameChange = new EventEmitter<string>();
  @Output() readonly contactEmailChange = new EventEmitter<string>();
  @Output() readonly contactPhoneChange = new EventEmitter<string>();
}
