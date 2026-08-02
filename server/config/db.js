const mongoose = require('mongoose');

// Establishes connection to MongoDB Atlas using Mongoose.
// Exits the process on failure so process managers (pm2, docker) can restart cleanly.
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      // Fail fast (10s) instead of the driver's 30s default, so connection
      // problems (bad IP whitelist, paused cluster, blocked network) show up
      // quickly in the terminal instead of every request silently hanging.
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on('error', (err) => {
      console.error(`MongoDB connection error: ${err}`);
    });

    mongoose.connection.on('disconnected', () => {
      console.warn(
        'MongoDB disconnected — the driver will try to reconnect automatically. ' +
          'If this persists, check that your Atlas cluster is not paused and that your current IP is allowed under Network Access.'
      );
    });

    mongoose.connection.on('reconnected', () => {
      console.log('MongoDB reconnected.');
    });
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    console.error(
      'Common causes: your IP is not whitelisted in Atlas > Network Access, the cluster is paused, ' +
        'or a firewall/VPN/antivirus is blocking outbound port 27017.'
    );
    process.exit(1);
  }
};

module.exports = connectDB;
