/// <reference path="../.astro/types.d.ts" />

interface ImportMetaEnv {
    readonly PUBLIC_API_URL: string;
    readonly PUBLIC_TENANT_ID: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}