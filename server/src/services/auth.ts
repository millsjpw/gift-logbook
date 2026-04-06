import * as argon2 from "argon2";
import { Request } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { BadRequestError, UserNotAuthenticatedError } from "../api/errors.js";
import { config } from "../config.js";
import * as userDb from "../db/queries/users.js";
import * as sessionsDb from "../db/queries/sessions.js";
import { sessions, UserResponse } from "../db/schema.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

type LoginResponse = UserResponse & {
    accessToken: string;
    refreshToken: string;
};

export async function hashPassword(password: string): Promise<string> {
    return await argon2.hash(password);
}

export async function verifyPassword(hashedPassword: string, password: string): Promise<boolean> {
    return await argon2.verify(hashedPassword, password);
}

export function generateToken(userId: string): string {
    const now = Math.floor(Date.now() / 1000);
    const p: payload = {
        iss: config.session.issuer,
        sub: userId,
        iat: now,
        exp: now + config.session.defaultDuration
    };
    return jwt.sign(p, config.session.secret);
}

export function verifyToken(token: string) {
    let decoded: payload;
    try {
        decoded = jwt.verify(token, config.session.secret) as payload;
    } catch (err) {
        throw new UserNotAuthenticatedError("Invalid token");
    }

    if (decoded.iss !== config.session.issuer) {
        throw new UserNotAuthenticatedError("Invalid token issuer");
    }

    if (!decoded.sub) {
        throw new UserNotAuthenticatedError("Token missing subject");
    }

    return decoded.sub;
}

export function getBearerToken(req: Request): string {
    const authHeader = req.get("Authorization");
    if (!authHeader) {
        throw new UserNotAuthenticatedError("Missing Authorization header");
    }

    return extractBearerToken(authHeader);
}

function extractBearerToken(authHeader: string): string {
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
        throw new BadRequestError("Invalid Authorization header format");
    }
    return parts[1];
}

export function makeRefreshToken() {
    return crypto.randomBytes(32).toString("hex");
}

export async function login(email: string, password: string): Promise<LoginResponse> {
    // Find the user by email
    const user = await userDb.getUserByEmail(email);
    if (!user) {
        throw new UserNotAuthenticatedError("Invalid email or password");
    }

    // Verify the password
    const passwordValid = await verifyPassword(user.hashedPassword, password);
    if (!passwordValid) {
        throw new UserNotAuthenticatedError("Invalid email or password");
    }

    // Generate tokens and create session
    const accessToken = generateToken(user.id);
    const refreshToken = makeRefreshToken();

    await sessionsDb.createSession(user.id, refreshToken);

    return {
        id: user.id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        accessToken: accessToken,
        refreshToken
    } satisfies LoginResponse;
}

export async function refreshAccessToken(refreshToken: string) {
    const session = await sessionsDb.getSessionByToken(refreshToken);
    if (!session) {
        throw new UserNotAuthenticatedError("Invalid refresh token");
    }

    const user = await sessionsDb.getUserBySessionToken(refreshToken);
    if (!user) {
        throw new UserNotAuthenticatedError("Invalid refresh token");
    }

    const newRefreshToken = makeRefreshToken();
    await sessionsDb.updateSessionToken(refreshToken, newRefreshToken);

    return {
        accessToken: generateToken(user.id),
        refreshToken: newRefreshToken
    };
}

export async function logout(refreshToken: string): Promise<void> {
    try {
        await sessionsDb.revokeSession(refreshToken);
    } catch {
        // ignore — logout should never fail
    }
}