import { Schema } from "mongoose";

const structuredResultSchema = new Schema(
  {
    summary: { type: String, required: true },
    technicalOverview: { type: String, required: true },
    architectureExplanation: { type: String, required: true },
    featureBreakdown: { type: String, required: true },
    scalabilityNotes: { type: String, required: true },
    risks: { type: String, required: true },
    portfolioDescription: { type: String, required: true },
  },
  { _id: false }
);

export const analysisSchema = new Schema(
  {
    repositoryId: {
      type: Schema.Types.ObjectId,
      ref: "Repository",
      required: true,
      index: true,
    },
    structuredResult: {
      type: structuredResultSchema,
      required: true,
    },
    shareToken: {
      type: String,
      unique: true,
      sparse: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: false,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);
