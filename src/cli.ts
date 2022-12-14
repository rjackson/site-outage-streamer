import { Command } from "@commander-js/extra-typings";
import winston from "winston";
import SeaMonsterBends from "./lib/sea-monster-bends";
import { MISSING_CREDENTIALS_ERROR_MSG } from "./lib/sea-monster-bends/base";
import { SITE_NOT_FOUND_ERROR_MSG } from "./lib/sea-monster-bends/get-site-info";
import migrateOutages from "./migrate-outages";

interface CliOptions {
    site: string[];
    from?: string;
    to?: string;
    apiBaseUrl?: string;
    apiKey?: string;
    verbose: boolean;
}

const run = async (options: CliOptions) => {
    const {
        site: siteList,
        from,
        to,
        apiBaseUrl,
        apiKey,
        verbose
    } = options;

    try {
        winston.configure({
            level: verbose ? "verbose" : "info",
            format: winston.format.combine(winston.format.splat(), winston.format.cli()),
            transports: [new winston.transports.Console({})],
        });

        const client = apiBaseUrl || apiKey ?
            new SeaMonsterBends({
                baseUrl: apiBaseUrl,
                apiKey
            })
            : undefined;

        const migratedSiteOutages = await migrateOutages(
            siteList,
            {
                from,
                to,
                client
            }
        );

        winston.info(`Successfully forwarded ${migratedSiteOutages.length} outages`);

    } catch (e) {
        // Missing credentials
        if (e && typeof e == "object" && "message" in e) {
            switch (e.message) {
                case MISSING_CREDENTIALS_ERROR_MSG:
                    winston.error("Could not resolve API credentials. Please set options --api-base-url and --api-key, or environmental variables SMB_BASE_URL and SMB_API_KEY");
                    return;

                case SITE_NOT_FOUND_ERROR_MSG:
                    winston.error("Unable to find information on the site(s) provided. Please double check the site IDs.");
                    return;
            }
        }

        throw e;
    }
};

const validateDate = (value: string) => {
    if (isNaN(Date.parse(value))) {
        throw new Error(`Invalid date string ${value}`);
    }

    return value;
};

const program = new Command()
    .requiredOption("-s, --site <site...>", "Sites whose outages we wish to publish")
    .option("-f, --from <from>", "Ignore outages before this date", validateDate)
    .option("-t, --to <to>", "Ignore outages after this date", validateDate)
    .option("--api-base-url <baseUrl>", "Base URL for the Sea Monster Bends API. If not set, will attempt to load SMB_BASE_URL environmental variable.")
    .option("--api-key <apiKey>", "API Key for the Sea Monster Bends API. If not set, will attempt to load SMB_API_KEY environmental variable.")
    .option("-v, --verbose", "Enable verbose logging", false)
    .showHelpAfterError()
    .action(run);

program.parse();
