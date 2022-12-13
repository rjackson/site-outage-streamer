import SeaMonsterBends from "../../../src/lib/sea-monster-bends";
import fetchMock from "jest-fetch-mock";
import siteInfoValidWithDevices from "../../fixtures/site-info/valid.json";
import siteInfoValidwithoutDevices from "../../fixtures/site-info/valid-no-devices.json";
import siteInfoMalformedTypes from "../../fixtures/site-info/malformed-types.json";
import siteInfoMissingProperty from "../../fixtures/site-info/missing-properties.json";
import errorJson from "../../fixtures/generic/error.json";

const smb = new SeaMonsterBends({
    baseUrl: "http://example.com",
    apiKey: "smbApiKey123"
});

beforeEach(() => {
    fetchMock.resetMocks();
});

test("should return site info (with devices)", async () => {
    fetchMock.mockResponse(JSON.stringify(siteInfoValidWithDevices), {
        headers: {
            "Content-Type": "application/json"
        }
    });

    const siteInfo = await smb.getSiteInfo("test-site-many-devices");

    expect(fetchMock.mock.lastCall?.[0]).toEqual("http://example.com/site-info/test-site-many-devices");
    expect(siteInfo).toMatchObject(siteInfoValidWithDevices);
});

test("should return site info (without devices)", async () => {
    fetchMock.mockResponse(JSON.stringify(siteInfoValidwithoutDevices), {
        headers: {
            "Content-Type": "application/json"
        }
    });

    const siteInfo = await smb.getSiteInfo("test-site-no-devices");

    expect(fetchMock.mock.lastCall?.[0]).toEqual("http://example.com/site-info/test-site-no-devices");
    expect(siteInfo).toMatchObject(siteInfoValidwithoutDevices);
});

test("should throw error on malformed response (malformed types)", async () => {
    fetchMock.mockResponse(JSON.stringify(siteInfoMalformedTypes), {
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.getSiteInfo("blah")).rejects.toThrow(Error);
    expect(smb.getSiteInfo("blah")).rejects.toThrow("Site Info API returned malformed data");
});

test("should throw error on malformed response (missing properties)", async () => {
    fetchMock.mockResponse(JSON.stringify(siteInfoMissingProperty), {
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.getSiteInfo("blah")).rejects.toThrow(Error);
    expect(smb.getSiteInfo("blah")).rejects.toThrow("Site Info API returned malformed data");
});

test("should throw error on malformed response (API error with 200 response)", async () => {
    fetchMock.mockResponse(JSON.stringify(errorJson), {
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.getSiteInfo("blah")).rejects.toThrow(Error);
    expect(smb.getSiteInfo("blah")).rejects.toThrow("I shouldn't have given you a 200 response, but I did!");
});

test("should throw error on HTTP errors (with json error)", async () => {
    fetchMock.mockResponse(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.getSiteInfo("blah")).rejects.toThrow(Error);
    expect(smb.getSiteInfo("blah")).rejects.toThrow("Unexpected response from Site Info API: Forbidden");
});

test("should throw error on HTTP errors (without json error)", async () => {
    fetchMock.mockResponse("", {
        status: 404
    });

    expect(smb.getSiteInfo("blah")).rejects.toThrow(Error);
    expect(smb.getSiteInfo("blah")).rejects.toThrow("Unexpected response from Site Info API: 404");
});