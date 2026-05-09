import { Component, OnDestroy, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NewsletterService } from '../../services/newsletter-service';

@Component({
  selector: 'app-newsletter-dialog',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './newsletter-dialog.component.html',
  styleUrl: './newsletter-dialog.component.scss'
})
export class NewsletterDialogComponent implements OnInit, OnDestroy {
  private static readonly appearedStorageKey = 'newsletterDialog.hasAppeared';

  private readonly newsletterService = inject(NewsletterService);
  private showTimer: ReturnType<typeof setTimeout> | null = null;
  private successDismissTimer: ReturnType<typeof setTimeout> | null = null;

  visible = false;
  isSubmitting = false;
  isSuccess = false;
  hasSignedUp = false;
  hasDismissedWithoutSignup = false;
  submitError = '';

  firstName = '';
  lastName = '';
  email = '';

  ngOnInit(): void {
    if (this.hasAppearedInPreviousSession()) {
      this.hasDismissedWithoutSignup = true;
      return;
    }

    this.showTimer = setTimeout(() => {
      this.visible = true;
      this.markAsAppeared();
    }, 5000);
  }

  ngOnDestroy(): void {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }

    if (this.successDismissTimer) {
      clearTimeout(this.successDismissTimer);
      this.successDismissTimer = null;
    }
  }

  close(userDismissed = false): void {
    this.visible = false;
    this.isSuccess = false;

    if (userDismissed && !this.hasSignedUp) {
      this.hasDismissedWithoutSignup = true;
    }

    if (this.successDismissTimer) {
      clearTimeout(this.successDismissTimer);
      this.successDismissTimer = null;
    }
  }

  reopen(): void {
    this.visible = true;
    this.submitError = '';
    this.hasDismissedWithoutSignup = false;
  }

  submit(): void {
    if (this.isSubmitting) {
      return;
    }

    this.submitError = '';
    this.isSubmitting = true;

    this.newsletterService.subscribeToList(this.email, this.firstName, this.lastName).subscribe({
      next: () => {
        this.isSubmitting = false;
        this.hasSignedUp = true;
        this.hasDismissedWithoutSignup = false;
        this.isSuccess = true;
        this.successDismissTimer = setTimeout(() => {
          this.close();
        }, 3000);
      },
      error: () => {
        this.isSubmitting = false;
        this.submitError = 'Unable to sign up right now. Please try again.';
      }
    });
  }

  private hasAppearedInPreviousSession(): boolean {
    try {
      return localStorage.getItem(NewsletterDialogComponent.appearedStorageKey) === 'true';
    } catch {
      return false;
    }
  }

  private markAsAppeared(): void {
    try {
      localStorage.setItem(NewsletterDialogComponent.appearedStorageKey, 'true');
    } catch {
      // Ignore storage failures and continue without persistence.
    }
  }

}
