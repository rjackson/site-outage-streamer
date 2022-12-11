# KF Backend Test

This project has been created to fulfil a technical challenge.

The requirements of this project is to consume a mock API with three endpoints:

- `GET /outages`
- `GET /site-info`
- `POST /site-outages/{siteId}`

And build a sort-of outage forwarder, taking entries from the Outage endpoint and forwarding them to the Site Outage endpoint.

We are also only concerned with entries from a certain date onwards. Possibly analogous of a bulk migration of historic data from one provider to another, where the full historical record is surplus to requirements.

I can imagine something like this being built as a:

1. One-off tool to migrate data between platforms
2. A microservice to send site-specific outage webhooks (instantiating 1 service per configured webhook)
3. An event stream forwarder, consuming messages from one topic and re-publishing them to site-specific topics

   This is essentially identical to use-case #2 whilst we're talking HTTP.

For this technical test, I intend to build the first option: A one-off command-line tool to migrate outage data.

## Getting Started

Install any dependencies:

```sh
npm install
```

## Usage

For a one-off bulk migration of outages to site-specific endpoints, you can use `dist/migrate-outages`.

Usage:

```txt
(todo)
```

For example, to migrate all outages in July 2022 for 2 sites:

```sh
node dist/migrate-outages --site very-unreliable-place --site slightly-more-reliable-place --from 2022-07-01 --to 2022-07-31
```

Example output:

```txt
(todo)
```
