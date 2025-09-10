import express from "express";
import {
  getItems,
  createItemRequest,
  getItemRequests,
  getItemRequestById,
  createItemReservation,
  getItemReservationsForRequest
} from "../services/inventoryRequestService";

const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");

// router.get('/items', authenticateUser, async (req, res) => {
//   try {
//     const items = await getItems();
//     res.json({ items });
//   } catch (error) {
//     console.error('Error fetching items:', error);
//     res.status(500).json({ error: 'Failed to fetch items' });
//   }
// });

router.get('/items', async (req, res) => {
  try {
    console.log("Items route called"); // Debug log
    const items = await getItems();
    console.log("Items from database:", items); // Debug log
    console.log("Number of items:", items.length); // Debug log
    res.json({ items });
  } catch (error) {
    console.error('Error fetching items:', error);
    res.status(500).json({ error: 'Failed to fetch items' });
  }
});

router.get("/item-requests", authenticateUser, async (req, res) => {
  try {
    const requests = await getItemRequests();
    res.json(requests);
  } catch (error) {
    console.error("Error fetching item requests:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/item-requests/:id", authenticateUser, async (req, res) => {
  try {
    const request = await getItemRequestById(req.params.id);
    if (!request) return res.status(404).json({ message: "Request not found" });

    const reservations = await getItemReservationsForRequest(req.params.id);
    request.item_reservations = reservations;

    res.json(request);
  } catch (error) {
    console.error("Error fetching item request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/item-requests", authenticateUser, async (req, res) => {
  try {
    const { user_id, reason, status } = req.body;
    const newRequest = await createItemRequest({ user_id, reason, status });
    res.status(201).json(newRequest);
  } catch (error) {
    console.error("Error creating item request:", error);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/item-reservations", authenticateUser, async (req, res) => {
  try {
    const { user_id, request_id, from_time, to_time } = req.body;
    const reservation = await createItemReservation({ user_id, request_id, from_time, to_time });
    res.status(201).json(reservation);
  } catch (error) {
    console.error("Error creating item reservation:", error);
    res.status(500).json({ message: "Server error" });
  }
});

export default router;