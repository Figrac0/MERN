const mongoose = require("mongoose");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@${process.env.MONGO_CLUSTER}/${process.env.MONGO_DB}?retryWrites=true&w=majority`;

let cachedConnectionPromise = null;

const connectDatabase = async () => {
    if (mongoose.connection.readyState === 1) {
        return mongoose.connection;
    }

    if (!cachedConnectionPromise) {
        cachedConnectionPromise = mongoose.connect(MONGODB_URI);
    }

    try {
        await cachedConnectionPromise;
        return mongoose.connection;
    } catch (err) {
        cachedConnectionPromise = null;
        throw err;
    }
};

module.exports = connectDatabase;
