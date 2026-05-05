import { AsyncPipe } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { Store } from '@ngrx/store';
import { Subscription } from 'rxjs';
import { GlobalActions } from '../../global/store/global.actions';
import { globalFeature } from '../../global/store/global.reducer';

@Component({
  selector: 'app-notification',
  standalone: true,
  imports: [AsyncPipe],
  templateUrl: './notification.component.html',
  styleUrl: './notification.component.scss'
})
export class NotificationComponent implements OnDestroy {
  private readonly store = inject(Store);

  readonly notification$ = this.store.select(globalFeature.selectNotification);

  private hideTimer: ReturnType<typeof setTimeout> | null = null;
  private sub: Subscription;

  constructor() {
    this.sub = this.notification$.subscribe((notification) => {
      this.clearTimer();
      if (!notification.displayed || !notification.message.trim()) {
        return;
      }
      this.hideTimer = setTimeout(() => {
        this.store.dispatch(GlobalActions.clearNotification());
      }, Math.max(500, notification.duration));
    });
  }

  ngOnDestroy(): void {
    this.clearTimer();
    this.sub.unsubscribe();
  }

  dismiss(): void {
    this.clearTimer();
    this.store.dispatch(GlobalActions.clearNotification());
  }

  private clearTimer(): void {
    if (!this.hideTimer) {
      return;
    }
    clearTimeout(this.hideTimer);
    this.hideTimer = null;
  }
}
