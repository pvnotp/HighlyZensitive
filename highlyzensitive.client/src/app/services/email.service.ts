import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface SendEmailRequest {
  to: string;
  subject: string;
  body: string;
}

@Injectable({ providedIn: 'root' })
export class EmailService {
  private readonly apiUrl = '/gmail/sendEmail';

  constructor(private http: HttpClient) {}

  sendEmail(request: SendEmailRequest): Observable<any> {
    return this.http.post(this.apiUrl, request);
  }
}
