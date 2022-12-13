import { SiteInfo } from "../lib/sea-monster-bends/get-site-info";

type DeviceId = string
type DeviceName = string
type SiteId = string
type SiteName = string

export type DeviceLookupDetails = {
    deviceId: DeviceId
    deviceName: DeviceName
    siteId: SiteId
    siteName: SiteName
}

type DeviceLookupMapEntry = [DeviceId, DeviceLookupDetails]

const siteToDeviceLookupMapEntries: (site: SiteInfo) => DeviceLookupMapEntry[] = (site) => {
    const { id: siteId, name: siteName, devices } = site;
    return devices.map((device) => {
        const { id: deviceId, name: deviceName } = device;
        return [deviceId, { deviceId, deviceName, siteId, siteName }];
    });
};

export type DeviceLookupMap = Map<DeviceId, DeviceLookupDetails>

/**
 * Resolve given list of sites into a map of device IDs to relevant details needed to publish a Site Outage message
 */
const buildDeviceLookupMap: (sites: SiteInfo[]) => DeviceLookupMap = (sites) => {
    const deviceMapEntries = sites.flatMap(siteToDeviceLookupMapEntries);
    return new Map(deviceMapEntries);
};

export default buildDeviceLookupMap;