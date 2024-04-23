import express from "express";

import { deleteUser, getAllUsers, updateUser } from "../controllers/users";
import { isAuthenticated } from "../middlewares/index";

export default (router: express.Router) => {
    router.get("/users", isAuthenticated, getAllUsers);
    router.put("/users/:id", isAuthenticated, updateUser)
    router.delete("/users/:id", isAuthenticated, deleteUser)
};