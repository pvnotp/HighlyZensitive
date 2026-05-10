import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NewsletterService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = '/newsletter/getSignUp';

	requestSignupEmail(email: string): Observable<void> {
		return this.http.get<void>(this.apiUrl, { params: { email } });
	}
}
