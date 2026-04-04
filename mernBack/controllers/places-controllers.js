const { validationResult } = require("express-validator");
const mongoose = require("mongoose");

const HttpError = require("../models/https-error");
const getCoordsForAddress = require("../util/location");
const Place = require("../models/place");
const User = require("../models/user");
const {
    deleteStoredImage,
    storeUploadedImage,
} = require("../util/asset-storage");

const getPlaceById = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        return next(
            new HttpError("Something went wrong, could not find a place.", 500),
        );
    }

    if (!place) {
        return next(
            new HttpError("Could not find a place for the provided id.", 404),
        );
    }

    res.json({ place: place.toObject({ getters: true }) });
};

const getPlacesByUserId = async (req, res, next) => {
    const userId = req.params.uid;

    let userWithPlaces;
    try {
        userWithPlaces = await User.findById(userId).populate("places");
    } catch (err) {
        return next(
            new HttpError("Fetching places failed, please try again later", 500),
        );
    }

    if (!userWithPlaces || userWithPlaces.places.length === 0) {
        return next(
            new HttpError("Could not find places for the provided user id.", 404),
        );
    }

    res.json({
        places: userWithPlaces.places.map((place) =>
            place.toObject({ getters: true }),
        ),
    });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422),
        );
    }

    const { title, description, address, creator } = req.body;

    if (!req.file) {
        return next(new HttpError("Please provide an image for the place.", 422));
    }

    if (creator !== req.userData.userId) {
        return next(
            new HttpError(
                "You are not allowed to create a place for this user.",
                401,
            ),
        );
    }

    let coordinates;
    try {
        coordinates = await getCoordsForAddress(address);
    } catch (err) {
        return next(err);
    }

    let uploadedImage;
    try {
        uploadedImage = await storeUploadedImage(req.file, "places");
    } catch (err) {
        return next(err);
    }

    const createdPlace = new Place({
        title,
        description,
        address,
        location: coordinates,
        image: uploadedImage.imageUrl,
        imagePublicId: uploadedImage.imagePublicId || undefined,
        creator: req.userData.userId,
    });

    let user;
    try {
        user = await User.findById(creator);
    } catch (err) {
        await deleteStoredImage({
            imagePublicId: uploadedImage?.imagePublicId,
            imagePath: uploadedImage?.imageUrl,
        });
        return next(new HttpError("Creating place failed, please try again.", 500));
    }

    if (!user) {
        await deleteStoredImage({
            imagePublicId: uploadedImage?.imagePublicId,
            imagePath: uploadedImage?.imageUrl,
        });
        return next(new HttpError("Could not find user for provided id.", 404));
    }

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await createdPlace.save({ session: sess });
        user.places.push(createdPlace);
        await user.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        await deleteStoredImage({
            imagePublicId: uploadedImage?.imagePublicId,
            imagePath: uploadedImage?.imageUrl,
        });
        return next(new HttpError("Creating place failed, please try again.", 500));
    }

    res.status(201).json({ place: createdPlace.toObject({ getters: true }) });
};

const updatePlace = async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError("Invalid inputs passed, please check your data.", 422),
        );
    }

    const { title, description } = req.body;
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId);
    } catch (err) {
        return next(
            new HttpError("Something went wrong, could not update place.", 500),
        );
    }

    if (place.creator.toString() !== req.userData.userId) {
        return next(
            new HttpError("You are not allowed to edit this place.", 401),
        );
    }

    place.title = title;
    place.description = description;

    try {
        await place.save();
    } catch (err) {
        return next(
            new HttpError("Something went wrong, could not update place.", 500),
        );
    }

    res.status(200).json({ place: place.toObject({ getters: true }) });
};

const deletePlace = async (req, res, next) => {
    const placeId = req.params.pid;

    let place;
    try {
        place = await Place.findById(placeId).populate("creator");
    } catch (err) {
        return next(
            new HttpError("Something went wrong, could not delete place.", 500),
        );
    }

    if (!place) {
        return next(new HttpError("Could not find place for this id.", 404));
    }

    if (place.creator.id !== req.userData.userId) {
        return next(
            new HttpError("You are not allowed to delete this place.", 401),
        );
    }

    const storedImage = {
        imagePublicId: place.imagePublicId,
        imagePath: place.image,
    };

    try {
        const sess = await mongoose.startSession();
        sess.startTransaction();
        await place.deleteOne({ session: sess });
        place.creator.places.pull(place);
        await place.creator.save({ session: sess });
        await sess.commitTransaction();
    } catch (err) {
        return next(
            new HttpError("Something went wrong, could not delete place.", 500),
        );
    }

    await deleteStoredImage(storedImage);

    res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;
