require("dotenv").config();
const fs = require("fs");
const path = require("path");

const express = require("express");
const bodyParser = require("body-parser");

const assistantRoutes = require("./routes/assistant-routes");
const placesRoutes = require("./routes/places-routes");
const usersRoutes = require("./routes/users-routes");

const HttpError = require("./models/https-error");
const connectDatabase = require("./util/db");

const app = express();

app.use(bodyParser.json());

app.use("/uploads/images", express.static(path.join("uploads", "images")));

app.use(async (req, res, next) => {
    try {
        await connectDatabase();
        next();
    } catch (err) {
        next(
            new HttpError(
                "Could not connect to the database. Please try again later.",
                500,
            ),
        );
    }
});

app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization",
    );
    res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, PATCH, DELETE, OPTIONS",
    );

    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }

    next();
});

app.use("/api/places", placesRoutes);

app.use("/api/assistant", assistantRoutes);

app.use("/api/users", usersRoutes);

app.use((req, res, next) => {
    const error = new HttpError("Could not find this route", 404);
    throw error;
});

app.use((error, req, res, next) => {
    if (req.file && req.file.path) {
        fs.unlink(req.file.path, (err) => {
            console.log(err);
        });
    }

    if (res.headerSent) {
        return next(error);
    }
    res.status(error.code || 500);
    res.json({ message: error.message || "An unknown error occurred!" });
});

module.exports = app;

if (!process.env.VERCEL) {
    connectDatabase()
        .then(() => {
            app.listen(5000);
        })
        .catch((err) => {
            console.log(err);
        });
}
