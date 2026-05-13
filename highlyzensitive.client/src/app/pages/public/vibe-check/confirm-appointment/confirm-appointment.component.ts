import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Actions, ofType } from '@ngrx/effects';
import { Store } from '@ngrx/store';
import { Subject, takeUntil } from 'rxjs';
import { VibeCheckActions } from '../store/vibe-check.actions';
import { BookingStatus, DialogStatus } from '../store/vibe-check.state';
import { selectConfirmDialogViewModel } from '../store/vibe-check.selectors';

@Component({
  selector: 'app-confirm-appointment',
  standalone: true,
  imports: [AsyncPipe, FormsModule],
  templateUrl: './confirm-appointment.component.html',
  styleUrl: './confirm-appointment.component.scss'
})
export class ConfirmAppointmentComponent implements OnDestroy {
  private readonly store = inject(Store);
  private readonly actions$ = inject(Actions);
  private readonly destroy$ = new Subject<void>();

  readonly DialogStatus = DialogStatus;
  readonly BookingStatus = BookingStatus;
  readonly vm$ = this.store.select(selectConfirmDialogViewModel);

  note = '';

  constructor() {
    this.actions$
      .pipe(ofType(VibeCheckActions.submitAppointmentSuccess), takeUntil(this.destroy$))
      .subscribe(() => {
        this.note = '';
      });
  }

  get isSubmitDisabled(): boolean {
    return false; // bookingStatus.status === Submitting handled by template binding
  }

  requestClose(): void {
    this.store.dispatch(VibeCheckActions.closeDialog());
  }

  submitAppointment(): void {
    this.store.dispatch(VibeCheckActions.submitAppointment({ note: this.note.trim() }));
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

