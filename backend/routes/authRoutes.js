import express from "express";
import { 
    loginWithGoogle, 
    loginWithUsernamePassword, 
    verifyToken } from "../services/authService.js";

const router = express.Router();

router.post("/login", async (req, res) => {
    const { idToken, username, password } = req.body;

    if (idToken) {
        const response = await loginWithGoogle(idToken);
        if (response.error) {
            return res.status(response.status).json({ message: response.error });
        }
        return res.json(response);
    } 
    
    if (username && password) {
        const response = await loginWithUsernamePassword(username, password);
        if (response.error) {
            return res.status(response.status).json({ message: response.error });
        }
        return res.json(response);
    }

    res.status(400).json({ message: "Invalid request" });
});

router.get("/auth/verify", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  try {
      const userData = await verifyToken(token);
      res.json(userData);
  } catch (error) {
      console.error("Auth verification failed:", error);
      res.status(401).json({ error: error.message });
  }
});

export default router;