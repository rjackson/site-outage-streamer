import { SiteInfo } from "../../src/lib/sea-monster-bends/get-site-info";
import buildDeviceLookupMap from "../../src/util/build-device-lookup-map";

test("should build empty map when not given any sites", async () => {
    const sites: SiteInfo[] = [];
    const deviceLookupMap = await buildDeviceLookupMap(sites);
    expect(deviceLookupMap.size == 0);
});

test("should build map from a mix of sites (variation 1)", async () => {
    const sites: SiteInfo[] = [
        {
            id: "test-site-no-devices",
            name: "test-site-no-devices",
            devices: []
        },
        {
            id: "test-site-many-devices",
            name: "Test Site Many Devices",
            devices: [
                {
                    id: "341B3DA0-E5B4-42C6-9FBB-AC8ED929ACAE",
                    name: "Really Big Heater"
                },
                {
                    id: "376B452D-841F-4FD7-A9EC-25B865C47E99",
                    name: "Equally Large Air Conditioner"
                }
            ]
        },
        {
            id: "test-site-one-devices",
            name: "Test Site One Devices",
            devices: [
                {
                    id: "C285DC47-B2D9-4532-9E3E-6BD97A24110E",
                    name: "A functional microwave"
                },
            ]
        }
    ];

    const deviceLookupMap = await buildDeviceLookupMap(sites);

    expect(deviceLookupMap.size).toEqual(3);
    expect(deviceLookupMap.get("341B3DA0-E5B4-42C6-9FBB-AC8ED929ACAE")).toMatchObject({
        deviceId: "341B3DA0-E5B4-42C6-9FBB-AC8ED929ACAE",
        deviceName: "Really Big Heater",
        siteId: "test-site-many-devices",
        siteName: "Test Site Many Devices"
    });
    expect(deviceLookupMap.get("376B452D-841F-4FD7-A9EC-25B865C47E99")).toMatchObject({
        deviceId: "376B452D-841F-4FD7-A9EC-25B865C47E99",
        deviceName: "Equally Large Air Conditioner",
        siteId: "test-site-many-devices",
        siteName: "Test Site Many Devices"
    });
    expect(deviceLookupMap.get("C285DC47-B2D9-4532-9E3E-6BD97A24110E")).toMatchObject({
        deviceId: "C285DC47-B2D9-4532-9E3E-6BD97A24110E",
        deviceName: "A functional microwave",
        siteId: "test-site-one-devices",
        siteName: "Test Site One Devices"
    });
});