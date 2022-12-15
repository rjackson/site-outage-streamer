import SeaMonsterBends from "./lib/sea-monster-bends";
import { Outage } from "./lib/sea-monster-bends/get-outages";
import { SiteOutageDetails } from "./lib/sea-monster-bends/post-site-outage";
import outageWithinDates from "./predicates/outage-within-dates";
import buildDeviceLookupMap, { DeviceLookupDetails } from "./util/build-device-lookup-map";

export interface MigrateOutagesOptions {
    /**
     * Do not migrate outages that occured before this date
     */
    from?: string

    /**
     * Do not migrate outages that occured after this date
     */
    to?: string

    /**
     * Custom SeaMonsterBends client. Will be initialised from environmental variables if not provided.
     */
    client?: SeaMonsterBends
}

const buildSiteOutage: (outage: Outage, deviceDetails: DeviceLookupDetails) => SiteOutageDetails = (outage, deviceDetails) => {
    const { id: id, begin, end } = outage;
    const { deviceName: name } = deviceDetails;

    return {
        id,
        name,
        begin,
        end
    };
};

/**
 * Migrates outages from the general Outages API to the site-specific Outage API
 * 
 * Will return an array of successfully migrated SiteOutageDetails.
 */
const migrateOutages: (siteNames: string[], options?: MigrateOutagesOptions) => Promise<SiteOutageDetails[]> = async (siteNames, options) => {
    const client = options?.client ?? new SeaMonsterBends();
    const sites = await Promise.all(siteNames.map(siteName => client.getSiteInfo(siteName)));
    const deviceLookupMap = buildDeviceLookupMap(sites);

    // No sites or devices that warrant forwarding outages about.
    if (deviceLookupMap.size == 0) {
        return [];
    }

    const outages = await client.getOutages();

    const filteredOutages = outages.filter((outage) => {
        return deviceLookupMap.has(outage.id) &&
            outageWithinDates(outage, options?.from, options?.to);
    });

    const outagesDetailsBySite = filteredOutages.reduce((outagesDetailsBySite, outage) => {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        const deviceDetails = deviceLookupMap.get(outage.id)!;
        const siteOutageDetails = buildSiteOutage(outage, deviceDetails);

        const { siteId } = deviceDetails;
        outagesDetailsBySite.set(siteId,
            [
                ...outagesDetailsBySite.get(siteId) ?? [],
                siteOutageDetails
            ]
        );

        return outagesDetailsBySite;
    }, new Map<string, SiteOutageDetails[]>);

    const siteOutageSubmissions = await Promise.allSettled(
        Array.from(outagesDetailsBySite.entries()).map(async ([siteId, siteOutageDetailsList]) => {
            try {
                await client.postSiteOutage(siteId, siteOutageDetailsList);
            } catch (e) {
                // TODO: Opportunity for error handling, if there's anything we want to do here?
                throw e;
            }

            return siteOutageDetailsList;
        })
    );

    return siteOutageSubmissions
        .filter(({ status }) => status == "fulfilled")
        .flatMap((result) => (result as PromiseFulfilledResult<SiteOutageDetails[]>).value);
};

export default migrateOutages;