const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connectDB = async () => {
    try {
        // Try to start Memory Server
        try {
            mongod = await MongoMemoryServer.create();
            uri = mongod.getUri();
            console.log(`MongoDB Memory Server started at ${uri}`);
        } catch (err) {
            console.error("Failed to start MongoDB Memory Server (Network Issue?). Falling back to local MongoDB.");
            console.error(err.message);
            uri = 'mongodb://localhost:27017/rebound';
        }

        const conn = await mongoose.connect(uri);

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        return conn;
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
