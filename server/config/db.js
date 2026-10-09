import mongoose from 'mongoose';

const connectDB = async () => {
  let uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/oda_roba_hospital_ms';

  // If placeholder password exists, fallback to local MongoDB
  if (uri.includes('<db_password>') || uri.includes('<password>')) {
    console.warn('[ORHIMS Database Warning] Placeholder <db_password> detected in MONGODB_URI. Falling back to local MongoDB.');
    uri = 'mongodb://127.0.0.1:27017/oda_roba_hospital_ms';
  }

  try {
    const conn = await mongoose.connect(uri);
    console.log(`[ORHIMS Database] MongoDB Connected successfully to: ${conn.connection.host}`);
  } catch (error) {
    // If remote connection fails, attempt local fallback
    if (uri !== 'mongodb://127.0.0.1:27017/oda_roba_hospital_ms') {
      console.warn(`[ORHIMS Database Warning] Failed to connect to ${uri}. Attempting local MongoDB fallback...`);
      try {
        const localConn = await mongoose.connect('mongodb://127.0.0.1:27017/oda_roba_hospital_ms');
        console.log(`[ORHIMS Database] Local MongoDB Connected successfully: ${localConn.connection.host}`);
        return;
      } catch (localErr) {
        console.error(`[ORHIMS Database Error] Local fallback also failed: ${localErr.message}`);
      }
    }
    console.error(`[ORHIMS Database Error] ${error.message}`);
    process.exit(1);
  }
};

export default connectDB;
