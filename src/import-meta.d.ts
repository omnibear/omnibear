/**
 * WXT environment variable types for import.meta.env
 * @see https://wxt.dev/guide/essentials/config/environment-variables.html#built-in-environment-variables
 */
interface ImportMetaEnv {
    readonly BROWSER: string;
    readonly CHROME: boolean;
    readonly FIREFOX: boolean;
    readonly SAFARI: boolean;
    readonly EDGE: boolean;
    readonly OPERA: boolean;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
