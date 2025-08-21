import express from "express";
const {
  createTransfer,
  getTransfers,
  getTransferById,
  updateTransfer,
  deleteTransfer
} = require("../services/transferRequestService");
const router = express.Router();

router.get("/transfers", authenticateUser, async (req, res) => {
    try {
        const transfers = await getTransfers();
        res.json({ transfers });
    } catch (error) {
        console.error("Error fetching transfers:", error);
        res.status(500).json({ message: "Error fetching transfers" });
    }
});

router.get("/transfers/:id", authenticateUser, async (req, res) => {
    try {
        const transfer = await getTransferById(req.params.id);
        if (!transfer) {
            return res.status(404).json({ message: "Transfer not found" });
        }
        res.json({ transfer });
    } catch (error) {
        console.error("Error fetching transfer:", error);
        res.status(500).json({ message: "Error fetching transfer" });
    }
});

router.post("/transfers", authenticateUser, async (req, res) => {
  try {
    const { request_id, item_id, from_location, to_location, transfer_type, reason, from_time, to_time } = req.body;
    const { transfer_id } = await createTransfer({
      request_id,
      item_id,
      from_location,
      to_location,
      transfer_type,
      reason,
      from_time,
      to_time
    });
    res.status(201).json({ transfer_id });
  } catch (error) {
    console.error("Error creating transfer:", error);
    res.status(500).json({ message: "Error creating transfer" });
  }
});

router.put("/transfers/:id", authenticateUser, async (req, res) => {
  try {
    const { request_id, item_id, from_location, to_location, transfer_type, reason, from_time, to_time } = req.body;
    await updateTransfer(req.params.id, {
      request_id,
      item_id,
      from_location,
      to_location,
      transfer_type,
      reason,
      from_time,
      to_time
    });
    res.json({ message: "Transfer updated" });
  } catch (error) {
    console.error("Error updating transfer:", error);
    res.status(500).json({ message: "Error updating transfer" });
  }
});

router.delete("/transfers/:id", authenticateUser, async (req, res) => {
  try {
    await deleteTransfer(req.params.id);
    res.json({ message: "Transfer deleted" });
  } catch (error) {
    console.error("Error deleting transfer:", error);
    res.status(500).json({ message: "Error deleting transfer" });
  }
});

module.exports = router;