declare global {
    var browser: typeof import("webextension-polyfill");
}

// This ensures the file is treated as a module
export { };
