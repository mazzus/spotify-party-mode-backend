import express from "express";
import mongoose from "mongoose";
import signInRouter from "./signIn";
import roomRouter from "./room";

const { MONGO_CONNECTION_STRING } = process.env;

mongoose.Promise = global.Promise;

const app = express();

mongoose.connect(MONGO_CONNECTION_STRING, { useMongoClient: true });

app.use("/sign-in", signInRouter);
app.use("/room", roomRouter);

app.listen(3001);
