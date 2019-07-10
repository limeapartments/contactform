# emailer

A simple express server for handling contact form submissions on the limeapartments website.

## Configuration

Server can be configured by supplying environment variables for the sender email, password, and receiver addresses. The sending account should be gmail based and should allow insecure applications.

### `SENDER_EMAIL`

The email account to send info _from_. This should be a gmail account and will attempt to auth with gmail's SMTP servers.

### `SENDER_PASSWORD`

The password for the above email account.

### `RECEIVER_EMAILS`

A comma separated list of emails that should receive contact form information.
