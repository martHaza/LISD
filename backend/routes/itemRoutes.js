const express = require("express");
const {
  getItemByItemNumber
} = require("../services/itemService");

const router = express.Router();
const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

router.get("/items/item_number/:item_number", authenticateUser, async (req, res) => {
  try {
    const item = await getItemByItemNumber(req.params.item_number);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }
    res.json(item);
  } catch (error) {
    console.error("Error fetching item:", error);
    res.status(500).json({ message: "Error fetching item" });
  }
});

module.exports = router;
