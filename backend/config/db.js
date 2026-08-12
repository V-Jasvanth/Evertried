const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);

        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.log("========== FULL ERROR ==========");
        console.dir(error, { depth: null });
        console.log("================================");
        process.exit(1);
    }
}; 

module.exports = connectDB;