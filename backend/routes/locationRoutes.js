const express = require("express");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");

router.get("/factual-location", authenticateUser, async (req, res) => {
    try {
        const locations = await getFactualLocations();
        res.json(locations);
    } catch (error) {
        console.error("Error fetching factual locations:", error);
        res.status(500).json({ message: "Error fetching factual locations" });
    }
});

router.get("/juridical-location", authenticateUser, async (req, res) => {
    try {
        const locations = await getJuridicalLocations();
        res.json(locations);
    } catch (error) {
        console.error("Error fetching juridical locations:", error);
        res.status(500).json({ message: "Error fetching juridical locations" });
    }
});

router.get("/temporary-location", authenticateUser, async (req, res) => {
    try {
        const locations = await getTemporaryLocations();
        res.json(locations);
    } catch (error) {
        console.error("Error fetching temporary locations:", error);
        res.status(500).json({ message: "Error fetching temporary locations" });
    }
});

module.exports = router;


