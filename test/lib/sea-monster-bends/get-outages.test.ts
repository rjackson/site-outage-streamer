import SeaMonsterBends from "../../../src/lib/sea-monster-bends";
import fetchMock from "jest-fetch-mock";
import outagesValid from "./fixtures/get-outages/valid.json";
import outagesMalformedTypes from "./fixtures/get-outages/malformed-types.json";
import outagesMissingProperty from "./fixtures/get-outages/missing-properties.json";
import errorJson from "./fixtures/error.json";

const smb = new SeaMonsterBends({
    baseUrl: "http://example.com",
    apiKey: "smbApiKey123"
});

beforeEach(() => {
    fetchMock.resetMocks();
});

test("should return list of outages", async () => {
    fetchMock.mockResponse(JSON.stringify(outagesValid), {
        headers: {
            "Content-Type": "application/json"
        }
    });

    const outages = await smb.getOutages();

    expect(fetchMock.mock.lastCall?.[0]).toEqual("http://example.com/outages");
    expect(outages).toMatchObject(outagesValid);
});

test("should throw error on malformed response (malformed types)", async () => {
    fetchMock.mockResponse(JSON.stringify(outagesMalformedTypes), {
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.getOutages()).rejects.toThrow(Error);
    expect(smb.getOutages()).rejects.toThrow("Outages API returned malformed data");
});

test("should throw error on malformed response (missing properties)", async () => {
    fetchMock.mockResponse(JSON.stringify(outagesMissingProperty), {
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.getOutages()).rejects.toThrow(Error);
    expect(smb.getOutages()).rejects.toThrow("Outages API returned malformed data");
});

test("should throw error on malformed response (API error with 200 response)", async () => {
    fetchMock.mockResponse(JSON.stringify(errorJson), {
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.getOutages()).rejects.toThrow(Error);
    expect(smb.getOutages()).rejects.toThrow("I shouldn't have given you a 200 response, but I did!");
});

test("should throw error on HTTP errors (with json error)", async () => {
    fetchMock.mockResponse(JSON.stringify({ message: "Forbidden" }), {
        status: 403,
        headers: {
            "Content-Type": "application/json"
        }
    });

    expect(smb.getOutages()).rejects.toThrow(Error);
    expect(smb.getOutages()).rejects.toThrow("Unexpected response from Outages API: Forbidden");
});

test("should throw error on HTTP errors (without json error)", async () => {
    fetchMock.mockResponse("", {
        status: 404
    });

    expect(smb.getOutages()).rejects.toThrow(Error);
    expect(smb.getOutages()).rejects.toThrow("Unexpected response from Outages API: 404");
});