import type { Request, Response } from "express";
import { BadRequestError } from "./errors.js";
import { respondWithJSON } from "./json.js";
import * as userService from "../services/users.js";
import { UserResponse } from "../db/schema.js";

export async function handleCreateUser(req: Request, res: Response) {
    type parameters = {
        name: string;
        email: string;
        password: string;
    };

    const params: parameters = req.body;

    if (!params.name || !params.email || !params.password) {
        throw new BadRequestError("Missing required fields: name, email, password");
    }

    const user: UserResponse = await userService.addUser(params.name, params.email, params.password);
    respondWithJSON(res, 201, user);
}

export async function handleGetUser(req: Request, res: Response) {
    const [userId] = req.params.id;
    const user = await userService.getUserById(userId);
    respondWithJSON(res, 200, user);
}

export async function handleUpdateUser(req: Request, res: Response) {
    const [userId] = req.params.id;
    const { name, email, password } = req.body;

    if (!name && !email && !password) {
        throw new BadRequestError("At least one field (name, email, password) must be provided for update");
    }

    const updatedUser = await userService.updateUser(userId, name, email, password);
    respondWithJSON(res, 200, updatedUser);
}

export async function handleDeleteUser(req: Request, res: Response) {
    const [userId] = req.params.id;
    await userService.deleteUser(userId);
    res.status(204).send();
}