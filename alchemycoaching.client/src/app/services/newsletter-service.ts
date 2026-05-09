import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsletterAttributes {
	fName: string;
	lName: string;
}

export interface NewsletterSubscribeRequest {
	email: string;
	attributes: NewsletterAttributes;
	listIds: number[];
	emailBlacklisted: boolean;
	smsBlacklisted: boolean;
	updateEnabled: boolean;
}

@Injectable({ providedIn: 'root' })
export class NewsletterService {
	private readonly http = inject(HttpClient);
	private readonly apiUrl = '/newsletter/subscribe';

	subscribe(request: NewsletterSubscribeRequest): Observable<void> {
		return this.http.post<void>(this.apiUrl, request);
	}

	subscribeToList(email: string, listId = 2): Observable<void> {
		const request: NewsletterSubscribeRequest = {
			email,
			attributes: {
				fName: "",
				lName: ""
			},
			listIds: [listId],
			emailBlacklisted: false,
			smsBlacklisted: false,
			updateEnabled: true
		};

		return this.subscribe(request);
	}
}
