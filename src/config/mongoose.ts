import mongoose from "mongoose";

interface DatabaseConfig {
    connectionString: string
    databaseName: string
}

export const configureMongoose = async (config: DatabaseConfig) => {
    mongoose.set("toJSON", {
        virtuals: true,
        versionKey: false,
        transform: (_, converted) => {
            converted.id = converted._id;
            delete converted._id;
        }
    });

    try {
        const db = mongoose.connection;
        db.on("connecting", () => console.log("Mongoose connecting..."));
        db.on("connected", () => console.log("Mongoose connected successfully!"));
        db.on("disconnecting", () => console.log("Mongoose disconnecting..."));
        db.on("disconnected", () => console.log("Mongoose disconnected successfully!"));
        db.on("error", (err: Error) => console.log("Mongoose database error:", err));

        await mongoose.connect(config.connectionString, { dbName: config.databaseName });
    }
    catch (err) {
        console.log(`Mongoose database error: ${err}`);
        throw err;
    }
};