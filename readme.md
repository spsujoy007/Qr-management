# QR Ticket Verifier

Lightweight demo for generating QR codes, booking tickets, and verifying user email addresses. The frontend is plain HTML/JS with Tailwind CDN; the backend is an Express API with MongoDB, Nodemailer, and JWT.

## Features
- Generate short-lived QR codes that encode a verification URL.
- Collect booking info (name, Gmail) against a QR reference code.
- Send a verification email with a link to confirm the booking.
- Check verification status by email.

## Stack
- Frontend: HTML, Tailwind CDN, vanilla JS.
- Backend: Node.js (Express), MongoDB, Nodemailer, JSON Web Tokens, QRCode.

## Prerequisites
- Node.js 18+
- MongoDB instance (local or hosted)
- Gmail account with App Password enabled for SMTP (or adjust transporter)

## Setup
1) Install backend deps
```
cd backend
npm install
```
2) Create backend/.env
```
MONGODB_URI=mongodb+srv://<user>:<pass>@<cluster>/qr_generator?retryWrites=true&w=majority
MAIL_USER=your_gmail_address
MAIL_PASS=your_gmail_app_password
JWT_SECRET=replace_with_strong_secret
```
3) Run the API
```
npm run start
```
The server listens on http://localhost:5000.

4) Serve the frontend (examples)
- VS Code Live Server on the project root (commonly https://qrmanagement-sp.netlify.app)
- Or: `python -m http.server 5500` from the project root

## Frontend pages
- index.html — generate QR, check email verification status.
- verify.html — submit name + Gmail against the QR code reference.
- verify_email.html — confirmation page hit from the email link.

## API reference (backend/index.js)
- GET /generate_qr → creates a QR code image and token; returns `{ qr_url, code }`.
- POST /verify?code=123456 with `{ name, email }` → stores booking, marks code verified, emails verification link.
- GET /verify_email?code=123456 → marks email as verified.
- GET /verify_email_status?email=user@gmail.com → returns verification status for that email.

## Typical flow
- User clicks "Generate new" → fetches /generate_qr → displays QR.
- Scanning QR opens verify.html?code=XXXXXX → user submits name + Gmail → API sends email.
- User clicks email link → verify_email.html?code=XXXXXX → API marks email as verified.
- User (or admin) checks status via the email form on index.html.

## Notes and tips
- QR codes currently expire only via JWT expiry (3m) but DB records are not auto-pruned; consider cleanup.
- Email sender uses Gmail SMTP; adapt transporter if using another provider.
- validate client inputs further if exposing publicly.

## Troubleshooting
- CORS issues: frontend must hit http://localhost:5000 (or update fetch URLs).
- Email not sending: confirm MAIL_USER/MAIL_PASS and allow Gmail App Passwords.
- Mongo connection: verify MONGODB_URI and network access.