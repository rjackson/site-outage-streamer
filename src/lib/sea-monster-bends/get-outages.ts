import Base from "./base";

export interface Outage {
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
}

const isOutage = (variableToCheck: unknown): variableToCheck is Outage => {
    return typeof ((variableToCheck as Outage)?.id) === "string" &&
        typeof ((variableToCheck as Outage)?.begin) === "string" &&
        typeof ((variableToCheck as Outage)?.end) === "string";
};

async function getOutages(this: Base): Promise<Outage[]> {
    const response = await this.request("outages");

    const data: unknown = response.headers.get("Content-Type") === "application/json" ? await response.json() : null;

    if (!response.ok) {
        throw new Error("Unexpected response from Outages API: " + ((data as Error)?.message ?? response.status));
    }

    if (!Array.isArray(data) || !data.every(isOutage)) {
        throw new Error((data as Error)?.message ?? "Outages API returned malformed data");
    }

    return data;
}

export default getOutages;