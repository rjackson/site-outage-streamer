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

For a one-off bulk migration of outages to site-specific endpoints, you can use `dist/cli.js`.

```txt
Usage: cli [options]

Options:
  -s, --site <site...>      Sites whose outages we wish to publish
  -f, --from <from>         Ignore outages before this date
  -t, --to <to>             Ignore outages after this date
  --api-base-url <baseUrl>  Base URL for the Sea Monster Bends API. If not set,
                            will attempt to load SMB_BASE_URL environmental
                            variable.
  --api-key <apiKey>        API Key for the Sea Monster Bends API. If not set,
                            will attempt to load SMB_API_KEY environmental
                            variable.
  -v, --verbose             Enable verbose logging (default: false)
  -h, --help                display help for command
```

For example, to migrate all outages in July 2022 for 2 sites:

```sh
node dist/cli.js \
   --site very-unreliable-place \
   --site slightly-more-reliable-place \
   --from 2022-07-01 \
   --to 2022-07-31
```

Example output:

```txt
info:    Loaded 23 outages to parse
info:    Forwarded 4 outages to site very-unreliable-place
info:    Forwarded 1 outages to site slightly-more-reliable-place
info:    Successfully forwarded 5 outages
```

### Satisfying technical test requirements

To fulfil the technical test's exact requirements, there are 2 constraints to apply:

- Sites: `norwich-pear-tree`
- From: `2022-01-01T00:00:00.000Z`

First, set your API credentials:

```sh
export SMB_BASE_URL=<YOUR BASE URL>
export SMB_API_KEY=<YOUR API KEY>
```

And then execute the command with the relevant options set:

```sh
node dist/cli.js \
   --site norwich-pear-tree \
   --from '2022-01-01T00:00:00.000Z'
```

Output:

```txt
info:    Loaded 108 outages to parse
info:    Forwarded 10 outages to site norwich-pear-tree
info:    Successfully forwarded 10 outages
```
