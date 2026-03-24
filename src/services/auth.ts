import * as argon2 from "argon2";
import { Request } from "express";
import jwt from "jsonwebtoken";
import type { JwtPayload } from "jsonwebtoken";
import crypto from "crypto";
import { BadRequestError, UserNotAuthenticatedError } from "../api/errors.js";
import { config } from "../config.js";

type payload = Pick<JwtPayload, "iss" | "sub" | "iat" | "exp">;

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