import SeaMonsterBends from "../src/lib/sea-monster-bends";
import { SiteOutageDetails } from "../src/lib/sea-monster-bends/post-site-outage";
import migrateOutages, { MigrateOutagesOptions } from "../src/migrate-outages";
import outagesValid from "./fixtures/outages/valid.json";
import siteInfoNoDevices from "./fixtures/site-info/test-site-no-devices.json";
import siteInfoOneDevice from "./fixtures/site-info/test-site-one-device.json";
import siteInfoManyDevices from "./fixtures/site-info/test-site-many-devices.json";
import siteOutageReallyBigHeater from "./fixtures/site-outage-details/really-big-heater.json";
import siteOutageAirCon from "./fixtures/site-outage-details/equally-large-air-conditioner.json";
import siteOutageReasonableMicrowave from "./fixtures/site-outage-details/reasonable-microwave.json";

jest.mock("../src/lib/sea-monster-bends");

const smb = new SeaMonsterBends({
    baseUrl: "http://example.com/",
    apiKey: "test123"
}) as jest.MockedObject<SeaMonsterBends>;

const migrateOutagesOptions: MigrateOutagesOptions = {
    client: smb
};

beforeEach(() => {
    jest.resetAllMocks();
});

describe("site argument", () => {
    test("exits early if no sites are given", async () => {
        const siteOutageDetailsList = await migrateOutages([], migrateOutagesOptions);
        expect(siteOutageDetailsList).toHaveLength(0);

        expect(smb.getSiteInfo).not.toHaveBeenCalled();
        expect(smb.getOutages).not.toHaveBeenCalled();
        expect(smb.postSiteOutage).not.toHaveBeenCalled();
    });

    test("exits early if given sites have no devices", async () => {
        smb.getSiteInfo.mockResolvedValue(siteInfoNoDevices);

        const siteOutageDetailsList = await migrateOutages([
            "test-site-no-devices"
        ], migrateOutagesOptions);
        expect(siteOutageDetailsList).toHaveLength(0);

        expect(smb.getSiteInfo).toHaveBeenCalled();

        expect(smb.getOutages).not.toHaveBeenCalled();
        expect(smb.postSiteOutage).not.toHaveBeenCalled();
    });

    test("migrate outages (one site, one device)", async () => {
        smb.getOutages.mockResolvedValue(outagesValid);
        smb.getSiteInfo.mockResolvedValue(siteInfoOneDevice);

        const siteOutageDetailsList = await migrateOutages([
            "test-site-one-device"
        ], migrateOutagesOptions);

        // We submitted relevant outages to postSiteOutage
        expect(smb.postSiteOutage).toHaveBeenCalledTimes(1);
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            1,
            "test-site-one-device",
            siteOutageReasonableMicrowave
        );

        // We'll return the details we managed to post
        expect(siteOutageDetailsList).toHaveLength(1);
        expect(siteOutageDetailsList).toEqual([
            siteOutageReasonableMicrowave
        ]);
    });

    test("migrate outages (one site, multiple devices)", async () => {
        smb.getOutages.mockResolvedValue(outagesValid);
        smb.getSiteInfo.mockResolvedValue(siteInfoManyDevices);

        const siteOutageDetailsList = await migrateOutages([
            "test-site-many-devices"
        ], migrateOutagesOptions);

        // We submitted relevant outages to postSiteOutage
        expect(smb.postSiteOutage).toHaveBeenCalledTimes(2);
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            1,
            "test-site-many-devices",
            siteOutageReallyBigHeater
        );
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            2,
            "test-site-many-devices",
            siteOutageAirCon
        );

        // We'll return the details we managed to post
        expect(siteOutageDetailsList).toHaveLength(2);
        expect(siteOutageDetailsList).toEqual([
            siteOutageReallyBigHeater,
            siteOutageAirCon
        ]);
    });

    test("migrate outages (many site site with multiple devices)", async () => {
        smb.getOutages.mockResolvedValue(outagesValid);
        smb.getSiteInfo
            .mockResolvedValueOnce(siteInfoNoDevices)
            .mockResolvedValueOnce(siteInfoOneDevice)
            .mockResolvedValueOnce(siteInfoManyDevices);

        const siteOutageDetailsList = await migrateOutages([
            "test-site-no-device",
            "test-site-one-device",
            "test-site-many-devices"
        ], migrateOutagesOptions);

        // We submitted relevant outages to postSiteOutage
        expect(smb.postSiteOutage).toHaveBeenCalledTimes(3);
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            1,
            "test-site-many-devices",
            siteOutageReallyBigHeater
        );
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            2,
            "test-site-many-devices",
            siteOutageAirCon
        );
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            3,
            "test-site-one-device",
            siteOutageReasonableMicrowave
        );

        // We'll return the details we managed to post
        expect(siteOutageDetailsList).toHaveLength(3);
        expect(siteOutageDetailsList).toEqual([
            siteOutageReallyBigHeater,
            siteOutageAirCon,
            siteOutageReasonableMicrowave
        ]);
    });
});

describe("date filtering", () => {
    test("don't migrate anything if there are no outages within the date range", async () => {
        smb.getOutages.mockResolvedValue(outagesValid);
        smb.getSiteInfo
            .mockResolvedValueOnce(siteInfoNoDevices)
            .mockResolvedValueOnce(siteInfoOneDevice)
            .mockResolvedValueOnce(siteInfoManyDevices);

        const siteOutageDetailsList = await migrateOutages([
            "test-site-no-device",
            "test-site-one-device",
            "test-site-many-devices"
        ], {
            ...migrateOutagesOptions,
            from: "2022-12-31T00:00:00.000Z",
            to: "2022-12-31T23:59:59.000Z"
        });

        // We submitted relevant outages to postSiteOutage
        expect(smb.getOutages).toHaveBeenCalled();
        expect(smb.getSiteInfo).toHaveBeenCalledTimes(3);
        expect(smb.postSiteOutage).not.toHaveBeenCalled();

        // We'll return the details we managed to post
        expect(siteOutageDetailsList).toHaveLength(0);
    });

    test("migrate outages after the from date only", async () => {
        smb.getOutages.mockResolvedValue(outagesValid);
        smb.getSiteInfo
            .mockResolvedValueOnce(siteInfoNoDevices)
            .mockResolvedValueOnce(siteInfoOneDevice)
            .mockResolvedValueOnce(siteInfoManyDevices);

        const siteOutageDetailsList = await migrateOutages([
            "test-site-no-device",
            "test-site-one-device",
            "test-site-many-devices"
        ], {
            ...migrateOutagesOptions,
            from: "2022-12-02T01:02:03.123Z"
        });

        // We submitted relevant outages to postSiteOutage
        expect(smb.getOutages).toHaveBeenCalled();
        expect(smb.getSiteInfo).toHaveBeenCalledTimes(3);
        expect(smb.postSiteOutage).toHaveBeenCalledTimes(2);
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            1,
            "test-site-many-devices",
            siteOutageAirCon
        );
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            2,
            "test-site-one-device",
            siteOutageReasonableMicrowave
        );

        // We'll return the details we managed to post
        expect(siteOutageDetailsList).toHaveLength(2);
        expect(siteOutageDetailsList).toEqual([
            siteOutageAirCon,
            siteOutageReasonableMicrowave
        ]);
    });

    test("migrate outages before the to date only", async () => {
        smb.getOutages.mockResolvedValue(outagesValid);
        smb.getSiteInfo
            .mockResolvedValueOnce(siteInfoNoDevices)
            .mockResolvedValueOnce(siteInfoOneDevice)
            .mockResolvedValueOnce(siteInfoManyDevices);

        const siteOutageDetailsList = await migrateOutages([
            "test-site-no-device",
            "test-site-one-device",
            "test-site-many-devices"
        ], {
            ...migrateOutagesOptions,
            to: "2022-12-02T23:59:59.123Z"
        });

        // We submitted relevant outages to postSiteOutage
        expect(smb.getOutages).toHaveBeenCalled();
        expect(smb.getSiteInfo).toHaveBeenCalledTimes(3);
        expect(smb.postSiteOutage).toHaveBeenCalledTimes(2);
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            1,
            "test-site-many-devices",
            siteOutageReallyBigHeater
        );
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            2,
            "test-site-many-devices",
            siteOutageAirCon
        );

        // We'll return the details we managed to post
        expect(siteOutageDetailsList).toHaveLength(2);
        expect(siteOutageDetailsList).toEqual([
            siteOutageReallyBigHeater,
            siteOutageAirCon
        ]);
    });

    test("migrate outages within the from and to dates", async () => {
        smb.getOutages.mockResolvedValue(outagesValid);
        smb.getSiteInfo
            .mockResolvedValueOnce(siteInfoNoDevices)
            .mockResolvedValueOnce(siteInfoOneDevice)
            .mockResolvedValueOnce(siteInfoManyDevices);

        const siteOutageDetailsList = await migrateOutages([
            "test-site-no-device",
            "test-site-one-device",
            "test-site-many-devices"
        ], {
            ...migrateOutagesOptions,
            from: "2022-12-02T01:02:03.123Z",
            to: "2022-12-02T23:59:59.123Z",
        });

        // We submitted relevant outages to postSiteOutage
        expect(smb.getOutages).toHaveBeenCalled();
        expect(smb.getSiteInfo).toHaveBeenCalledTimes(3);
        expect(smb.postSiteOutage).toHaveBeenCalledTimes(1);
        expect(smb.postSiteOutage).toHaveBeenCalledWith<[string, SiteOutageDetails]>(
            "test-site-many-devices",
            siteOutageAirCon
        );

        // We'll return the details we managed to post
        expect(siteOutageDetailsList).toHaveLength(1);
        expect(siteOutageDetailsList).toEqual([
            siteOutageAirCon,
        ]);
    });
});

describe("error handling", () => {
    test("Failing to load at least one site info throws error", () => {
        const t = async () => {
            smb.getOutages.mockResolvedValue(outagesValid);
            smb.getSiteInfo
                .mockResolvedValueOnce(siteInfoNoDevices)
                .mockRejectedValueOnce(new Error("Could not load site outage"))
                .mockResolvedValueOnce(siteInfoManyDevices);

            await migrateOutages([
                "test-site-no-device",
                "test-site-one-device",
                "test-site-many-devices"
            ], migrateOutagesOptions);
        };

        expect(t).rejects.toThrow(new Error("Could not load site outage"));
    });

    test("Failing to load outages throws error", () => {
        const t = async () => {
            smb.getOutages.mockRejectedValue(new Error("Could not load site outage"));
            smb.getSiteInfo
                .mockResolvedValueOnce(siteInfoNoDevices)
                .mockResolvedValueOnce(siteInfoOneDevice)
                .mockResolvedValueOnce(siteInfoManyDevices);

            await migrateOutages([
                "test-site-no-device",
                "test-site-one-device",
                "test-site-many-devices"
            ], migrateOutagesOptions);
        };

        expect(t).rejects.toThrow(new Error("Could not load site outage"));
    });

    test("No site outages are returned if they failed to POST", async () => {
        smb.getOutages.mockResolvedValue(outagesValid);
        smb.getSiteInfo
            .mockResolvedValueOnce(siteInfoNoDevices)
            .mockResolvedValueOnce(siteInfoOneDevice)
            .mockResolvedValueOnce(siteInfoManyDevices);
        smb.postSiteOutage
            .mockRejectedValue(new Error("Gremlins have chewed the wires"));

        const siteOutageDetailsList = await migrateOutages([
            "test-site-no-device",
            "test-site-one-device",
            "test-site-many-devices"
        ], migrateOutagesOptions);

        // We submitted relevant outages to postSiteOutage
        expect(smb.postSiteOutage).toHaveBeenCalledTimes(3);
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            1,
            "test-site-many-devices",
            siteOutageReallyBigHeater
        );
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            2,
            "test-site-many-devices",
            siteOutageAirCon
        );
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            3,
            "test-site-one-device",
            siteOutageReasonableMicrowave
        );

        // We'll return the details we managed to post
        expect(siteOutageDetailsList).toHaveLength(0);
    });

    test("One site outages is ommitted from the return array if it failed post", async () => {
        smb.getOutages.mockResolvedValue(outagesValid);
        smb.getSiteInfo
            .mockResolvedValueOnce(siteInfoNoDevices)
            .mockResolvedValueOnce(siteInfoOneDevice)
            .mockResolvedValueOnce(siteInfoManyDevices);
        smb.postSiteOutage
            .mockResolvedValueOnce()
            .mockRejectedValueOnce(new Error("Gremlins have chewed the wires"))
            .mockResolvedValueOnce();

        const siteOutageDetailsList = await migrateOutages([
            "test-site-no-device",
            "test-site-one-device",
            "test-site-many-devices"
        ], migrateOutagesOptions);

        // We submitted relevant outages to postSiteOutage
        expect(smb.postSiteOutage).toHaveBeenCalledTimes(3);
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            1,
            "test-site-many-devices",
            siteOutageReallyBigHeater
        );
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            2,
            "test-site-many-devices",
            siteOutageAirCon
        );
        expect(smb.postSiteOutage).toHaveBeenNthCalledWith<[string, SiteOutageDetails]>(
            3,
            "test-site-one-device",
            siteOutageReasonableMicrowave
        );

        // We'll return the details we managed to post
        expect(siteOutageDetailsList).toHaveLength(2);
        expect(siteOutageDetailsList).toEqual([
            siteOutageReallyBigHeater,
            siteOutageReasonableMicrowave
        ]);
    });
});