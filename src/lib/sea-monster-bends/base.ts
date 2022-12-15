import fetch, { RequestInit, Response } from "node-fetch";

export interface Options {
    /**
     * API's base URL. If not set, will be loaded from SMB_BASE_URL environmental variable.
     */
    baseUrl?: string;

    /**
     * API's base URL. If not set, will be loaded from SMB_API_KEY environmental variable.
     */
    apiKey?: string;
}

export const MISSING_CREDENTIALS_ERROR_MSG = "Missing credentials for Sea Monster Bends API";

export default class Base {
    baseUrl: string;
    apiKey: string;

    constructor(options?: Options) {
        const baseUrl = options?.baseUrl ?? process.env.SMB_BASE_URL;
        const apiKey = options?.apiKey ?? process.env.SMB_API_KEY;

        if (!baseUrl || !apiKey) {
            throw new Error(MISSING_CREDENTIALS_ERROR_MSG);
        }

        this.baseUrl = baseUrl;
        this.apiKey = apiKey;
    }

    request(resource: string, init?: RequestInit): Promise<Response> {
        const url = new URL(resource, this.baseUrl);

        return fetch(
            url.toString(), // jest-fetch-mock doesn't like raw URL objects?
            {
                ...init,
                headers: {
                    ...init?.headers,
                    "x-api-key": this.apiKey
                }
            }
        );
    }
}