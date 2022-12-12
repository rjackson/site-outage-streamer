import Base from "./base";

// Could extend from Outage, but there's no guarantee these schemas will continue to be consistent
export interface SiteOutageDetails {
    /**
     * Device ID that this outage relates to
     */
    id: string;

    /**
     * ISO-8601 timestamp of when this outage began
     */
    begin: string;

    /**
     * ISO-8601 timestamp of when this outage ended
     */
    end: string;

    /**
     * Name of the device that is suffering an outage
     */
    name: string;
}

async function postSiteOutage(this: Base, siteId: string, outageDetails: SiteOutageDetails): Promise<void> {
    const response = await this.request(`site-outages/${siteId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(outageDetails),
    });

    if (!response.ok) {
        const data: unknown = response.headers.get("Content-Type") === "application/json" ? await response.json() : null;
        throw new Error("Unexpected response from Site Outage API: " + ((data as Error)?.message ?? response.status));
    }
}

export default postSiteOutage;