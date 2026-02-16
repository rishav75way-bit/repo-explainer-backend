import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { env } from "../../common/config/index.js";
import { User } from "./auth.model.js";
import type { RegisterInput, LoginInput } from "./auth.validators.js";

const SALT_ROUNDS = 10;
const ACCESS_TOKEN_EXPIRY = "1h";
const REFRESH_TOKEN_EXPIRY = "7d";

export async function registerUser(input: RegisterInput) {
  const existing = await User.findOne({ email: input.email });
  if (existing) {
    throw new Error("Email already registered");
  }
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const user = await User.create({
    email: input.email,
    passwordHash,
  });
  return { id: user._id.toString(), email: user.email };
}

export async function loginUser(input: LoginInput) {
  const user = await User.findOne({ email: input.email });
  if (!user) {
    throw new Error("Invalid credentials");
  }
  const valid = await bcrypt.compare(input.password, user.passwordHash);
  if (!valid) {
    throw new Error("Invalid credentials");
  }
  const accessToken = jwt.sign(
    { sub: user._id.toString() },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const refreshToken = jwt.sign(
    { sub: user._id.toString() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  return {
    accessToken,
    refreshToken,
    user: { id: user._id.toString(), email: user.email },
  };
}

export async function refreshTokens(refreshToken: string) {
  const payload = jwt.verify(refreshToken, env.JWT_REFRESH_SECRET) as { sub: string };
  const user = await User.findById(payload.sub);
  if (!user) {
    throw new Error("User not found");
  }
  const accessToken = jwt.sign(
    { sub: user._id.toString() },
    env.JWT_SECRET,
    { expiresIn: ACCESS_TOKEN_EXPIRY }
  );
  const newRefreshToken = jwt.sign(
    { sub: user._id.toString() },
    env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRY }
  );
  return {
    accessToken,
    refreshToken: newRefreshToken,
    user: { id: user._id.toString(), email: user.email },
  };
}
