import mongoose from "mongoose";

interface Connection {
  connection: boolean;
}

const Connectionexists: Connection = {
  connection: false,
};
export const mongoDb = async () => {
  if (Connectionexists.connection) {
    console.log("Already connected to MongoDB.");
    return;
  }
  try {
    const mongoconnectioninstance = await mongoose.connect(
      process.env.MONGODB_URI!
    );
    Connectionexists.connection = true;
    console.log(
      `\n MongoDB connected !! DB HOST: ${mongoconnectioninstance.connection.host}`
    );
  } catch (error) {
    console.log("Mongoose connection terminated", error);
    await mongoose.connection.close();
    console.log("MongoDB connection closed. Exiting process...");
    process.exit(1);
  }
};