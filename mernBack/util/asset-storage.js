const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const { v1: uuid } = require("uuid");

const HttpError = require("../models/https-error");

const MIME_TYPE_MAP = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/jpg": "jpg",
};

const normalizeCloudinaryConfig = () => {
    if (process.env.CLOUDINARY_URL) {
        const parsedUrl = new URL(process.env.CLOUDINARY_URL);

        return {
            cloudName: parsedUrl.hostname,
            apiKey: decodeURIComponent(parsedUrl.username),
            apiSecret: decodeURIComponent(parsedUrl.password),
        };
    }

    if (
        process.env.CLOUDINARY_CLOUD_NAME &&
        process.env.CLOUDINARY_API_KEY &&
        process.env.CLOUDINARY_API_SECRET
    ) {
        return {
            cloudName: process.env.CLOUDINARY_CLOUD_NAME,
            apiKey: process.env.CLOUDINARY_API_KEY,
            apiSecret: process.env.CLOUDINARY_API_SECRET,
        };
    }

    return null;
};

const buildCloudinarySignature = (params, apiSecret) => {
    const serializedParams = Object.entries(params)
        .filter(([, value]) => value !== undefined && value !== null && value !== "")
        .sort(([firstKey], [secondKey]) => firstKey.localeCompare(secondKey))
        .map(([key, value]) => `${key}=${value}`)
        .join("&");

    return crypto
        .createHash("sha1")
        .update(`${serializedParams}${apiSecret}`)
        .digest("hex");
};

const normalizeStoredPath = (value = "") => value.replace(/\\/g, "/");

const isCloudinaryConfigured = () => !!normalizeCloudinaryConfig();

const uploadToCloudinary = async (file, folderName) => {
    const cloudinaryConfig = normalizeCloudinaryConfig();

    if (!cloudinaryConfig) {
        throw new HttpError("Cloud image storage is not configured.", 500);
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const uploadFolder = `${process.env.CLOUDINARY_FOLDER || "your-places"}/${folderName}`;
    const publicId = uuid();
    const uploadParams = {
        folder: uploadFolder,
        public_id: publicId,
        timestamp,
    };
    const signature = buildCloudinarySignature(
        uploadParams,
        cloudinaryConfig.apiSecret,
    );
    const formData = new FormData();

    formData.append(
        "file",
        new Blob([file.buffer], { type: file.mimetype }),
        file.originalname || `upload.${MIME_TYPE_MAP[file.mimetype] || "jpg"}`,
    );
    formData.append("folder", uploadFolder);
    formData.append("public_id", publicId);
    formData.append("timestamp", String(timestamp));
    formData.append("api_key", cloudinaryConfig.apiKey);
    formData.append("signature", signature);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        },
    );
    const responseData = await response.json();

    if (!response.ok || !responseData.secure_url || !responseData.public_id) {
        throw new HttpError(
            responseData.error?.message ||
                "Uploading the image failed. Please try again.",
            500,
        );
    }

    return {
        imageUrl: responseData.secure_url,
        imagePublicId: responseData.public_id,
    };
};

const storeUploadedImage = async (file, folderName) => {
    if (!file) {
        throw new HttpError("Image file is required.", 422);
    }

    if (isCloudinaryConfigured()) {
        return uploadToCloudinary(file, folderName);
    }

    return {
        imageUrl: normalizeStoredPath(file.path),
        imagePublicId: null,
    };
};

const deleteFromCloudinary = async (publicId) => {
    const cloudinaryConfig = normalizeCloudinaryConfig();

    if (!cloudinaryConfig || !publicId) {
        return;
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const destroyParams = {
        public_id: publicId,
        timestamp,
    };
    const signature = buildCloudinarySignature(
        destroyParams,
        cloudinaryConfig.apiSecret,
    );
    const formData = new FormData();

    formData.append("public_id", publicId);
    formData.append("timestamp", String(timestamp));
    formData.append("api_key", cloudinaryConfig.apiKey);
    formData.append("signature", signature);

    try {
        await fetch(
            `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/image/destroy`,
            {
                method: "POST",
                body: formData,
            },
        );
    } catch (err) {}
};

const deleteLocalFile = (imagePath) => {
    if (!imagePath) {
        return;
    }

    const resolvedPath = path.resolve(imagePath);
    if (!fs.existsSync(resolvedPath)) {
        return;
    }

    fs.unlink(resolvedPath, () => {});
};

const deleteStoredImage = async ({ imagePublicId, imagePath }) => {
    if (imagePublicId) {
        await deleteFromCloudinary(imagePublicId);
        return;
    }

    deleteLocalFile(imagePath);
};

module.exports = {
    deleteStoredImage,
    isCloudinaryConfigured,
    normalizeStoredPath,
    storeUploadedImage,
};
