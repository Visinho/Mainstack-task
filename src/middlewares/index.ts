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

        merge(req, { identity: existingUser });

        next();
    } catch (error) {
        console.error(error);
        return res.sendStatus(500);
    }
}

// export const isOwner = async (req: express.Request, res: express.Response, next: express.NextFunction) => {
//     try {
//         const { id } = req.params;
//         const currentUserId = get(req, "identity._id") as string;

//         if(!currentUserId) {
//             return res.sendStatus(403);
//         }

//         if(currentUserId !== id) {
//             return res.sendStatus(403);
//         }
//         next();
//     } catch (error) {
//         console.log(error);
//         return res.sendStatus(400);
//     }
// }