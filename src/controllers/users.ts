import express, { NextFunction } from "express";

import { getUsers } from "../models/users";

export const getAllUsers = async (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
        const users = await getUsers();

        return res.status(200).json(users)
    } catch (error) {
        console.log(error);
        return res.sendStatus(400);
    }
}