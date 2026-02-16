import mongoose from "mongoose";
import { repositorySchema } from "./repository.schema.js";

export const Repository = mongoose.models.Repository ?? mongoose.model("Repository", repositorySchema);
