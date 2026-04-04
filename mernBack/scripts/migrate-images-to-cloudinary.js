require("dotenv").config();

const fs = require("fs");
const path = require("path");

const connectDatabase = require("../util/db");
const User = require("../models/user");
const Place = require("../models/place");
const {
    isCloudinaryConfigured,
    normalizeStoredPath,
    storeUploadedImage,
} = require("../util/asset-storage");

const MIME_TYPE_BY_EXTENSION = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
};

const isRemoteImage = (value = "") => /^https?:\/\//i.test(String(value).trim());

const resolveLocalImagePath = (storedImagePath) => {
    const normalizedValue = normalizeStoredPath(storedImagePath);
    const withoutOrigin = normalizedValue.replace(/^https?:\/\/[^/]+\/+/, "");
    return path.resolve(withoutOrigin);
};

const buildFileFromPath = (absolutePath) => {
    const extension = path.extname(absolutePath).toLowerCase();
    const mimetype = MIME_TYPE_BY_EXTENSION[extension];

    if (!mimetype) {
        throw new Error(`Unsupported file type for ${absolutePath}`);
    }

    return {
        buffer: fs.readFileSync(absolutePath),
        originalname: path.basename(absolutePath),
        mimetype,
    };
};

const migrateCollection = async (documents, folderName, label) => {
    let migratedCount = 0;

    for (const document of documents) {
        if (!document.image || isRemoteImage(document.image)) {
            continue;
        }

        const absolutePath = resolveLocalImagePath(document.image);
        if (!fs.existsSync(absolutePath)) {
            console.log(`[skip] ${label} ${document.id}: file not found -> ${absolutePath}`);
            continue;
        }

        const uploadedImage = await storeUploadedImage(
            buildFileFromPath(absolutePath),
            folderName,
        );

        document.image = uploadedImage.imageUrl;
        document.imagePublicId = uploadedImage.imagePublicId;
        await document.save();
        migratedCount += 1;

        console.log(`[ok] ${label} ${document.id} migrated`);
    }

    return migratedCount;
};

const run = async () => {
    if (!isCloudinaryConfigured()) {
        throw new Error(
            "Cloudinary is not configured. Add CLOUDINARY_URL or Cloudinary credentials to your environment first.",
        );
    }

    await connectDatabase();

    const [users, places] = await Promise.all([User.find({}), Place.find({})]);

    const migratedUsers = await migrateCollection(users, "users", "user");
    const migratedPlaces = await migrateCollection(places, "places", "place");

    console.log(
        `Migration finished. Users: ${migratedUsers}, Places: ${migratedPlaces}`,
    );
    process.exit(0);
};

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
