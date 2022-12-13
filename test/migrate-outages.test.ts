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