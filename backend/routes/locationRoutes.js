import express from "express";
const router = express.Router();
import {
    getLocations,
    getFactualLocations,
    getJuridicalLocations,
    getTemporaryLocations,
    createLocation,
    updateLocation,
    deleteLocation,
    getLocationsForTransfer
} from "../services/locationService.js";

import { authenticateUser } from "../middleware/authMiddleware.js";

// router.get("/locations/list", authenticateUser, async (req, res) => {
//     try {
//         const locations = await getLocations();
//         res.json({ locations });
//     } catch (error) {
//         console.error("Error fetching locations:", error);
//         res.status(500).json({ message: "Error fetching locations" });
//     }
// });

router.get("/locations/transfer-list", authenticateUser, async (req, res) => {
    try {
        const locations = await getLocationsForTransfer();
        res.json({ locations });
    } catch (error) {
        console.error("Error fetching locations for transfer:", error);
        res.status(500).json({ message: "Error fetching locations for transfer" });
    }
});

router.get("/factual", authenticateUser, async (req, res) => {
    try {
        const locations = await getFactualLocations();
        res.json(locations);
    } catch (error) {
        console.error("Error fetching factual locations:", error);
        res.status(500).json({ message: "Error fetching factual locations" });
    }
});

router.get("/juridical", authenticateUser, async (req, res) => {
    try {
        const locations = await getJuridicalLocations();
        res.json(locations);
    } catch (error) {
        console.error("Error fetching juridical locations:", error);
        res.status(500).json({ message: "Error fetching juridical locations" });
    }
});

router.get("/temporary", authenticateUser, async (req, res) => {
    try {
        const locations = await getTemporaryLocations();
        res.json(locations);
    } catch (error) {
        console.error("Error fetching temporary locations:", error);
        res.status(500).json({ message: "Error fetching temporary locations" });
    }
});

// CREATE
router.post("/locations", authenticateUser, async (req, res) => {
    try {
        const { room } = req.body;
        const newLocation = await createLocation({ room });
        res.status(201).json(newLocation);
    } catch (error) {
        console.error("Error creating location:", error);
        res.status(500).json({ message: "Error creating location" });
    }
});

// UPDATE
router.put("/locations/:id", authenticateUser, async (req, res) => {
    try {
        const { room } = req.body;
        await updateLocation(req.params.id, { room });
        res.json({ message: "Location updated successfully" });
    } catch (error) {
        console.error("Error updating location:", error);
        res.status(500).json({ message: "Error updating location" });
    }
});

// DELETE
router.delete("/locations/:id", authenticateUser, async (req, res) => {
    try {
        await deleteLocation(req.params.id);
        res.json({ message: "Location deleted successfully" });
    } catch (error) {
        console.error("Error deleting location:", error);
        res.status(500).json({ message: "Error deleting location" });
    }
});

export default router;


