import mongoose from "mongoose";
import { analysisSchema } from "./analysis.schema.js";

export const Analysis = mongoose.models.Analysis ?? mongoose.model("Analysis", analysisSchema);
