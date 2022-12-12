import Base from "./base";

export interface Device {
    id: string;
    name: string;
}

const isDevice = (variableToCheck: unknown): variableToCheck is Device => {
    return typeof ((variableToCheck as Device)?.id) === "string" &&
        typeof ((variableToCheck as Device)?.name) === "string";
};

export interface SiteInfo {
    id: string;
    name: string;

    /**
     * A list of devices at this site
     */
    devices: Device[];
}

const isSiteInfo = (variableToCheck: unknown): variableToCheck is SiteInfo => {
    return typeof ((variableToCheck as SiteInfo)?.id) === "string" &&
        typeof ((variableToCheck as SiteInfo)?.name) === "string" &&
        Array.isArray((variableToCheck as SiteInfo)?.devices) &&
        (variableToCheck as SiteInfo).devices.every(device => isDevice(device));
};

async function getSiteInfo(this: Base, id: string): Promise<SiteInfo> {
    const response = await this.request(`site-info/${id}`);

    const data: unknown = response.headers.get("Content-Type") === "application/json" ? await response.json() : null;

    if (!response.ok) {
        throw new Error("Unexpected response from Site Info API: " + ((data as Error)?.message ?? response.status));
    }

    if (!isSiteInfo(data)) {
        throw new Error((data as Error)?.message ?? "Site Info API returned malformed data");
    }

    return data;
}

export default getSiteInfo;