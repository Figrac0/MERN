const axios = require("axios");

const HttpError = require("../models/https-error");

async function getCoordsForAddress(address) {
    try {
        const response = await axios.get(
            "https://nominatim.openstreetmap.org/search",
            {
                params: {
                    q: address,
                    format: "jsonv2",
                    limit: 1,
                },
                headers: {
                    Accept: "application/json",
                    "User-Agent": "mernBack/1.0",
                },
                timeout: 5000,
            },
        );

        const [place] = response.data || [];

        if (!place) {
            throw new HttpError(
                "Could not find location for the specified address",
                422,
            );
        }

        return {
            lat: Number(place.lat),
            lng: Number(place.lon),
        };
    } catch (error) {
        if (error instanceof HttpError) {
            throw error;
        }

        throw new HttpError(
            "Could not fetch location data, please try again later.",
            500,
        );
    }
}

module.exports = getCoordsForAddress;
