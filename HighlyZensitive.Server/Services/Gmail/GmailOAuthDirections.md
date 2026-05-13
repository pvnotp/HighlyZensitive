1. Prepare OAuth 2.0 Credentials
Go to APIs & Services > Credentials.
Ensure you have an OAuth 2.0 Client ID (Web application).
Confirm the client id and client secret are stored in your user secrets/env variables/key vault
Confirm your Authorized redirect URIs include your backend’s callback URL (e.g., https://yourdomain.com/auth/oauthtoken).

2. Add test users
Go to APIs & Services > OAuth consent screen.
Under "Test users," add the email address of any user who will authorize the app.

3. Build the OAuth Consent URL
Construct a URL like:
https://accounts.google.com/o/oauth2/v2/auth?client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&response_type=code&scope=https://www.googleapis.com/auth/gmail.send&access_type=offline&prompt=consent
Replace YOUR_CLIENT_ID and YOUR_REDIRECT_URI with your actual values.
Use scope=https://www.googleapis.com/auth/gmail.send for sending email.
access_type=offline ensures you get a refresh token.
prompt=consent forces Google to show the consent screen and return a refresh token.

4. Authorize the User
Visit the consent URL in a browser.
Log in with the Gmail account you want to authorize.
Approve the requested permissions.
Google will redirect to your backend’s redirect URI with a code parameter.

5. Exchange the Code for Tokens
Your backend receives the code at the redirect URI.
POST to https://oauth2.googleapis.com/token with:
code, client_id, client_secret, redirect_uri, grant_type=authorization_code
Google responds with:
access_token (short-lived)
refresh_token (long-lived, use to get new access tokens)

6. Store the Refresh Token Securely
Save the refresh_token in a secure location (environment variable, Azure App Service config, or user secrets for local dev).