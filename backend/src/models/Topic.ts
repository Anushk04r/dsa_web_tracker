import mongoose, { Schema, Document } from "mongoose";

export interface ITopic extends Document {
  name: string;
  category?: string;
  description?: string;
  totalProblems?: number;
}

const TopicSchema = new Schema<ITopic>(
  {
    name: { type: String, required: true },
    category: { type: String },
    description: { type: String },
    totalProblems: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Topic = mongoose.model<ITopic>("Topic", TopicSchema);


