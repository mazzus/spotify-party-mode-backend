import mongoose, { Schema } from "mongoose";
const ObjectId = Schema.ObjectId;

const roomSchema = new Schema({
  _id: {
    type: ObjectId,
    auto: true
  },
  name: { type: String, unique: true },
  created: Date,
  admin: ObjectId
});

export default mongoose.model("Room", roomSchema);
