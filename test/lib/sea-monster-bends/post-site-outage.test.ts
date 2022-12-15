import SeaMonsterBends from "../../../src/lib/sea-monster-bends";
import fetchMock from "jest-fetch-mock";
import siteOutageReallyBigHeater from "../../fixtures/site-outage-details/really-big-heater.json";
import siteOutageAirCon from "../../fixtures/site-outage-details/equally-large-air-conditioner.json";

const smb = new SeaMonsterBends({
    baseUrl: "http://example.com",
    apiKey: "smbApiKey123"
});

beforeEach(() => {
    fetchMock.resetMocks();
});

test("should send a valid site outage request, with one outage", async () => {
    fetchMock.mockResponse("", {
        status: 200
    });

    await smb.postSiteOutage("test-site-123", [siteOutageReallyBigHeater]);

    expect(fetchMock.mock.lastCall?.[0]).toEqual("http://example.com/site-outages/test-site-123");
    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify([siteOutageReallyBigHeater])
    });
});
test("should send a valid site outage request, with multiple outages", async () => {
    fetchMock.mockResponse("", {
        status: 200
    });

    await smb.postSiteOutage("test-site-123", [
        siteOutageReallyBigHeater,
        siteOutageAirCon
    ]);

    expect(fetchMock.mock.lastCall?.[0]).toEqual("http://example.com/site-outages/test-site-123");
    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify([
            siteOutageReallyBigHeater,
            siteOutageAirCon
        ])
    });
});

test("should throw error on HTTP errors (with json error)", async () => {
    fetchMock.mockResponse(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.postSiteOutage("test-site-123", [siteOutageReallyBigHeater])).rejects.toThrow(Error);
    expect(smb.postSiteOutage("test-site-123", [siteOutageReallyBigHeater])).rejects.toThrow("Unexpected response from Site Outage API: Forbidden");
});

test("should throw error on HTTP errors (without json error)", async () => {
    fetchMock.mockResponse("", {
        status: 404
    });

    expect(smb.postSiteOutage("test-site-123", [siteOutageReallyBigHeater])).rejects.toThrow(Error);
    expect(smb.postSiteOutage("test-site-123", [siteOutageReallyBigHeater])).rejects.toThrow("Unexpected response from Site Outage API: 404");
});