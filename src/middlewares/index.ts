import express from "express";
import { get, merge } from "lodash";

import { getUserBySessionToken } from "../models/users";

export const isAuthenticated = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
    try {
        const sessionToken = req.cookies["session_token"];
        if (!sessionToken) {
            return res.sendStatus(403);
        }

        const existingUser = await getUserBySessionToken(sessionToken);

        if (!existingUser) {
            return res.sendStatus(403);
        }

        // Assuming merge properly merges the user identity into the request object
        merge(req, { identity: existingUser });

        // Call next to pass control to the next middleware
        next();
    } catch (error) {
        console.error(error);
        // Return a generic server error status code
        return res.sendStatus(500);
    }
}