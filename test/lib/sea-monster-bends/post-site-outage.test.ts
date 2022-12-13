import SeaMonsterBends from "../../../src/lib/sea-monster-bends";
import fetchMock from "jest-fetch-mock";
import validSiteOutage from "../../fixtures/site-outage-details/valid.json";

const smb = new SeaMonsterBends({
    baseUrl: "http://example.com",
    apiKey: "smbApiKey123"
});

beforeEach(() => {
    fetchMock.resetMocks();
});

test("should send a valid site outage request", async () => {
    fetchMock.mockResponse("", {
        status: 200
    });

    await smb.postSiteOutage("test-site-123", validSiteOutage);

    expect(fetchMock.mock.lastCall?.[0]).toEqual("http://example.com/site-outages/test-site-123");
    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(validSiteOutage)
    });
});

test("should throw error on HTTP errors (with json error)", async () => {
    fetchMock.mockResponse(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.postSiteOutage("test-site-123", validSiteOutage)).rejects.toThrow(Error);
    expect(smb.postSiteOutage("test-site-123", validSiteOutage)).rejects.toThrow("Unexpected response from Site Outage API: Forbidden");
});

test("should throw error on HTTP errors (without json error)", async () => {
    fetchMock.mockResponse("", {
        status: 404
    });

    expect(smb.postSiteOutage("test-site-123", validSiteOutage)).rejects.toThrow(Error);
    expect(smb.postSiteOutage("test-site-123", validSiteOutage)).rejects.toThrow("Unexpected response from Site Outage API: 404");
});