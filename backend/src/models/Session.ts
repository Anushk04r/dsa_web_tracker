import mongoose, { Schema, Document, Types } from "mongoose";

export interface ISession extends Document {
  user: Types.ObjectId;
  date: Date;
  durationMinutes: number;
  problemsSolved: number;
  notes?: string;
}

const SessionSchema = new Schema<ISession>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    durationMinutes: { type: Number, required: true },
    problemsSolved: { type: Number, default: 0 },
    notes: { type: String },
  },
  { timestamps: true }
);

export const Session = mongoose.model<ISession>("Session", SessionSchema);


