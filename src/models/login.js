import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.ObjectId;

const loginSchema = new Schema({
    _id: {
        type: ObjectId,
        auto: true
    },
    initiated: Date,
    completed: Date,
    spotifyId: String,
    access_token: String,
    refresh_token: String,
    redirect_uri: String
})

export default mongoose.model("Login", loginSchema);