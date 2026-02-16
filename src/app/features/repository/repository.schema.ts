import { Schema } from "mongoose";

export const repositorySchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    repoUrl: {
      type: String,
      required: true,
    },
    repoName: {
      type: String,
      required: true,
    },
    analyzedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);
