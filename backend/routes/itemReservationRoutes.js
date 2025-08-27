import express from "express";
const {
  createItemReservation,
  getItemReservations,
  getItemReservationById,
  updateItemReservation,
  deleteItemReservation
} = require("../services/itemReservationService");
const router = express.Router();
const { authenticateUser } = require("../middleware/authMiddleware");

router.get("/item-reservations", authenticateUser, async (req, res) => {
  try {
    const reservations = await getItemReservations();
    res.json({ reservations });
  } catch (error) {
    console.error("Error fetching item reservations:", error);
    res.status(500).json({ message: "Error fetching reservations" });
  }
});

router.get("/item-reservations/:id", authenticateUser, async (req, res) => {
  try {
    const reservation = await getItemReservationById(req.params.id);
    if (!reservation) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({ reservation });
  } catch (error) {
    console.error("Error fetching reservation:", error);
    res.status(500).json({ message: "Error fetching reservation" });
  }
});

router.post("/item-reservations", authenticateUser, async (req, res) => {
  try {
    const { item_id, request_id, from_time, to_time } = req.body;
    const { item_reservation_id } = await createItemReservation({
      item_id,
      request_id,
      from_time,
      to_time
    });
    res.status(201).json({ item_reservation_id });
  } catch (error) {
    console.error("Error creating reservation:", error);
    res.status(500).json({ message: "Error creating reservation" });
  }
});

router.put("/item-reservations/:id", authenticateUser, async (req, res) => {
  try {
    const updated = await updateItemReservation(req.params.id, req.body);
    if (!updated) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({ message: "Reservation updated", updated });
  } catch (error) {
    console.error("Error updating reservation:", error);
    res.status(500).json({ message: "Error updating reservation" });
  }
});

router.delete("/item-reservations/:id", authenticateUser, async (req, res) => {
  try {
    const deleted = await deleteItemReservation(req.params.id);
    if (!deleted) {
      return res.status(404).json({ message: "Reservation not found" });
    }
    res.json({ message: "Reservation deleted" });
  } catch (error) {
    console.error("Error deleting reservation:", error);
    res.status(500).json({ message: "Error deleting reservation" });
  }
});

module.exports = router;