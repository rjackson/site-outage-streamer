import SeaMonsterBends from "../../../src/lib/sea-monster-bends";

beforeEach(() => {
    delete process.env.SMB_BASE_URL;
    delete process.env.SMB_API_KEY;
});

test("should resolve credentials from options", () => {
    process.env.SMB_BASE_URL = "envBaseUrl";
    process.env.SMB_API_KEY = "envApiKey";

    const smb = new SeaMonsterBends({
        baseUrl: "optionBaseUrl",
        apiKey: "optionApiKey"
    });

    expect(smb.baseUrl).toEqual("optionBaseUrl");
    expect(smb.apiKey).toEqual("optionApiKey");
});

test("should resolve credentials from environment", () => {
    process.env.SMB_BASE_URL = "envBaseUrl";
    process.env.SMB_API_KEY = "envApiKey";

    const smb = new SeaMonsterBends();

    expect(smb.baseUrl).toEqual("envBaseUrl");
    expect(smb.apiKey).toEqual("envApiKey");
});

test("should error if credentials are missing (completely)", () => {
    const t = () => {
        new SeaMonsterBends();
    };

    expect(t).toThrow(Error);
    expect(t).toThrow("Missing credentials for Sea Monster Bends API");
});

test("should error if credentials are missing (baseUrl)", () => {
    process.env.SMB_BASE_URL = "envBaseUrl";
    const t = () => {
        new SeaMonsterBends({
            baseUrl: "optionBaseUrl"
        });
    };

    expect(t).toThrow(Error);
    expect(t).toThrow("Missing credentials for Sea Monster Bends API");
});

test("should error if credentials are missing (apiKey)", () => {
    process.env.SMB_API_KEY = "envApiKey";
    const t = () => {
        new SeaMonsterBends({
            apiKey: "optionApiKey"
        });
    };

    expect(t).toThrow(Error);
    expect(t).toThrow("Missing credentials for Sea Monster Bends API");
});