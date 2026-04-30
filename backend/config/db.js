const mongoose = require('mongoose');

let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDb = async () => {
    if (cached.conn) {
        return cached.conn;
    }

    if (!cached.promise) {
        cached.promise = mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            socketTimeoutMS: 45000,
            connectTimeoutMS: 10000,
            tls: true,
        });
    }

    try {
        cached.conn = await cached.promise;
        console.log('MongoDB Connected to Porfolio', mongoose.connection.name);
    } catch (error) {
        cached.promise = null;
        console.log('MongoDB Connection Error:', error.message);
        throw error;
    }

    return cached.conn;
};

module.exports = connectDb;