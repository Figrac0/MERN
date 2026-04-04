const normalizeBaseUrl = (value, fallback) => {
    let normalizedValue = (value || fallback || "").trim().replace(/\\/g, "/");

    if (!normalizedValue) {
        return "";
    }

    if (/^https?:\/[^/]/i.test(normalizedValue)) {
        normalizedValue = normalizedValue.replace(
            /^([a-z]+):\/(?!\/)/i,
            "$1://",
        );
    } else if (!/^https?:\/\//i.test(normalizedValue)) {
        normalizedValue = `http://${normalizedValue.replace(/^\/+/, "")}`;
    }

    return normalizedValue.replace(/\/+$/, "");
};

const API_BASE_URL = normalizeBaseUrl(
    process.env.REACT_APP_BACKEND_URL,
    "http://localhost:5000/api",
);

const ASSET_BASE_URL = normalizeBaseUrl(
    process.env.REACT_APP_ASSET_URL,
    "http://localhost:5000",
);

export const buildApiUrl = (path = "") => {
    return `${API_BASE_URL}/${String(path).replace(/^\/+/, "")}`;
};

export const buildAssetUrl = (path = "") => {
    const normalizedPath = String(path || "").trim().replace(/\\/g, "/");

    if (!normalizedPath) {
        return "";
    }

    if (/^https?:\/\//i.test(normalizedPath)) {
        return normalizedPath;
    }

    if (/^https?:\/[^/]/i.test(normalizedPath)) {
        return normalizedPath.replace(/^([a-z]+):\/(?!\/)/i, "$1://");
    }

    return `${ASSET_BASE_URL}/${normalizedPath.replace(/^\/+/, "")}`;
};
