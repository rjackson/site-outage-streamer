import SeaMonsterBends from "../../../src/lib/sea-monster-bends";
import fetchMock from "jest-fetch-mock";

const smb = new SeaMonsterBends({
    baseUrl: "http://example.com",
    apiKey: "smbApiKey123"
});

beforeEach(() => {
    fetchMock.resetMocks();
});

test("should build endpoint and headers correctly", () => {
    fetchMock.doMock();

    smb.request("test-endpoint");

    expect(fetchMock.mock.lastCall?.[0]).toEqual("http://example.com/test-endpoint");
    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({
        headers: {
            "x-api-key": "smbApiKey123"
        }
    });
});

test("should merge request options correctly", () => {
    fetchMock.doMock();

    smb.request("test-endpoint", {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify("Hello world")
    });

    expect(fetchMock.mock.lastCall?.[0]).toEqual("http://example.com/test-endpoint");
    expect(fetchMock.mock.lastCall?.[1]).toMatchObject({
        method: "PATCH",
        headers: {
            "x-api-key": "smbApiKey123",
            "Content-Type": "application/json"
        },
        body: JSON.stringify("Hello world")
    });
});