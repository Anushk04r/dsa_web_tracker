import mongoose, { Schema, Document, Types } from "mongoose";

export type ProblemSource = "leetcode" | "gfg" | "codeforces" | "other";
export type ProblemDifficulty = "easy" | "medium" | "hard" | "unknown";
export type ProblemStatus = "unsolved" | "attempted" | "solved" | "review";

export interface IProblem extends Document {
  user: Types.ObjectId;
  topic?: Types.ObjectId;
  title: string;
  link?: string;
  source: ProblemSource;
  difficulty: ProblemDifficulty;
  tags: string[];
  status: ProblemStatus;
  notes?: string;
  solvedAt?: Date;
}

const ProblemSchema = new Schema<IProblem>(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    topic: { type: Schema.Types.ObjectId, ref: "Topic" },
    title: { type: String, required: true },
    link: { type: String },
    source: {
      type: String,
      enum: ["leetcode", "gfg", "codeforces", "other"],
      default: "other",
    },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard", "unknown"],
      default: "unknown",
    },
    tags: [{ type: String }],
    status: {
      type: String,
      enum: ["unsolved", "attempted", "solved", "review"],
      default: "unsolved",
    },
    notes: { type: String },
    solvedAt: { type: Date },
  },
  { timestamps: true }
);

export const Problem = mongoose.model<IProblem>("Problem", ProblemSchema);


