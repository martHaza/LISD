import express from "express";
import {
  getItemByItemNumber
} from "../services/itemService.js";
import {
  getAllItems
} from "../services/itemService.js";
import {
  getItems
} from "../services/itemService.js";
import {
  getItemsForTransfer
} from "../services/itemService.js"

const router = express.Router();
import { authenticateUser, authorizeRole } from "../middleware/authMiddleware.js";

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

router.get("/items", authenticateUser, async (req, res) => {
  try {
    const items = await getAllItems(); 
    res.json(items);
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ message: "Error fetching items" });
  }
});

// router.get("/items/list", authenticateUser, async (req, res) => {
//   try {
//     const items = await getItems(); 
//     res.json({ items });  
//   } catch (error) {
//     console.error("Error fetching items:", error);
//     res.status(500).json({ message: "Error fetching items" });
//   }
// });

router.get("/items/transfer-list", authenticateUser, async (req, res) => {
  try {
    const items = await getItemsForTransfer(); 
    res.json({ items });  
  } catch (error) {
    console.error("Error fetching items for transfer:", error);
    res.status(500).json({ message: "Error fetching items for transfer" });
  }
});

export default router;
