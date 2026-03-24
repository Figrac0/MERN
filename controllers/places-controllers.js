const { randomUUID } = require("crypto");
const { validationResult } = require("express-validator");

const HttpError = require("../models/https-error");
const getCoordsForAddress = require("../util/location");

let = DUMMY_PLACES = [
    {
        id: "p1",
        title: "Empire State Building",
        description: "One of the most famous sky scrapers in the world!",
        imageUrl:
            "https://upload.wikimedia.org/wikipedia/commons/thumb/d/df/NYC_Empire_State_Building.jpg/640px-NYC_Empire_State_Building.jpg",
        address: "20 W 34th St, New York, NY 10001, United States",
        location: {
            lat: 40.7484405,
            lng: -73.9856644,
        },
        creator: "u1",
    },
];

const getPlaceById = (req, res, next) => {
    const placeId = req.params.pid;

    const place = DUMMY_PLACES.find((p) => p.id === placeId);

    if (!place) {
        throw new HttpError(
            "Could not find a place for the provided place id",
            404,
        );

        // next(new Error("Could not find a place for the provided place id"));
    }

    res.json({ place });
};

const getPlacesByUserId = (req, res, next) => {
    const userId = req.params.uid;

    const places = DUMMY_PLACES.filter((p) => p.creator === userId);

    if (!places || places.length === 0) {
        return next(
            new HttpError(
                "Could not find a places for the provided place id",
                404,
            ),
        );

        // next(new Error("Could not find a place for the provided user id"));
    }

    res.json({ places });
};

const createPlace = async (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        next(
            new HttpError("Invalid inputs passed, please check your data", 422),
        );
    }

    const { title, description, address, creator } = req.body;

    let cordinates;

    try {
        cordinates = await getCoordsForAddress(address);
    } catch (error) {
        next(error);
    }

    const createdPlace = {
        id: randomUUID(),
        title,
        description,
        location: cordinates,
        address,
        creator,
    };

    DUMMY_PLACES.push(createdPlace);

    res.status(201).json({ place: createdPlace });
};

const updatePlaceById = (req, res, next) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        throw new HttpError(
            "Invalid inputs passed, please check your data",
            422,
        );
    }

    const { title, description } = req.body;

    const placeId = req.params.pid;

    const updatePlace = { ...DUMMY_PLACES.find((p) => p.id === placeId) };
    const placeIndex = DUMMY_PLACES.findIndex((p) => p.id === placeId);

    updatePlace.title = title;
    updatePlace.description = description;

    DUMMY_PLACES[placeIndex] = updatePlace;

    res.status(200).json({ place: updatePlace });

    if (!updatePlace) {
        throw new HttpError(
            "Could not find a place for the provided place id",
            404,
        );
    }
};

const deletePlaceById = (req, res, next) => {
    const placeId = req.params.pid;

    if (!DUMMY_PLACES.find((p) => p.id === placeId)) {
        throw new HttpError(
            "Could not find a place for the provided place id",
            404,
        );
    }

    DUMMY_PLACES = DUMMY_PLACES.filter((p) => p.id !== placeId);

    res.status(200).json({ message: "Deleted place." });
};

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlace = createPlace;
exports.updatePlaceById = updatePlaceById;
exports.deletePlaceById = deletePlaceById;
