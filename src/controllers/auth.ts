import express, { NextFunction } from "express";
import { authentication, random } from "../helpers/index";
import { createUser, getUserByEmail } from "../models/users";

export const register = async (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
        const { email, password, username } = req.body;

        // Check if required fields are missing
        if (!email || !password || !username) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Check if user with the given email already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
            return res.status(400).json({ error: 'User with this email already exists' });
        }

        // Generate salt and hash the password
        const salt = random();
        const hashedPassword = authentication(salt, password);

        // Create new user
        const newUser = await createUser({
            email,
            username,
            authentication: { salt, password: hashedPassword }
        });

        return res.status(201).json(newUser);
    } catch (error) {
        console.error('Error in registration:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const login = async (req: express.Request, res: express.Response, next: NextFunction) => {
    try {
        const { email, password } = req.body;

        // Check if email and password are provided
        if (!email || !password) {
            return res.status(400).json({ error: 'Email and password are required' });
        }

        // Find user by email and select the salt and password fields
        const user = await getUserByEmail(email).select("+authentication.salt +authentication.password");

        // Check if user exists
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Verify password
        const expectedHash = authentication(user.authentication.salt, password);
        if (user.authentication.password !== expectedHash) {
            return res.status(403).json({ error: 'Incorrect password' });
        }

        // Generate session token
        const salt = random();
        const sessionToken = authentication(salt, user._id.toString());

        // Set expiration time for the token (e.g., 1 hour)
        const expirationTime = new Date();
        expirationTime.setHours(expirationTime.getHours() + 1); // Token expires in 1 hour

        // Update user with session token and expiration time
        user.authentication.sessionToken = sessionToken;
        user.authentication.tokenExpiration = expirationTime;

        // Save the updated user to the database
        await user.save();

        // Set session token as a cookie
        res.cookie("session_token", sessionToken, { domain: "localhost", path: '/', expires: expirationTime, httpOnly: true });

        return res.status(200).json(user);
    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
