import express from "express";
const router = express.Router();
import { createIssue, getIssues, getIssueById, updateIssueStatus, deleteIssue } from "../services/issueService";

const { authenticateUser, authorizeRole } = require("../middleware/authMiddleware");

router.get("/issues", authenticateUser, async (req, res) => {
    try {
        const issues = await getIssues();
        res.json({ issues });
    } catch (error) {
        console.error("Error fetching issues:", error);
        res.status(500).json({ message: "Error fetching issues" });
    }
});

router.get("/issues/:id", authenticateUser, async (req, res) => {
    try {
        const issue = await getIssueById(req.params.id);
        if (!issue) {
            return res.status(404).json({ message: "Issue not found" });
        }
        const items = await getItemsForIssue(issues.issue_id);
        res.json({ issue, items });
    } catch (error) {
        console.error("Error fetching issue:", error);
        res.status(500).json({ message: "Error fetching issue" });
    }
});

router.post("/issues", authenticateUser, authorizeRole(["lietotājs", "laborants", "materiāli atbildīgā persona"]), async (req, res) => {
    try {
        const { user_id, title, description, status, item_ids } = req.body;

        const { issue_id } = await createIssue({ user_id, title, description, status });
        await createIssueItems(issue_id, item_ids);

        res.status(201).json({ issue_id });
    } catch (error) {
        console.error("Error creating issue:", error);
        res.status(500).json({ message: "Error creating issue" });
    }
});

router.put("/issues/:id/status", authenticateUser, authorizeRole(["laborants"]), async (req, res) => {
    try {
        const { status } = req.body;
        const { id } = req.params;

        if (!["pending", "solved", "unsolved"].includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        await updateIssueStatus(id, status);
        res.json({ message: "Status updated" });
    } catch (error) {
        console.error("Failed to update issue status:", error);
        res.status(500).json({ message: "Failed to update issue status" });
    }
});

router.put("/issues/:id/item/:itemId", authenticateUser, authorizeRole(["laborants"]), async (req, res) => {
    const { status } = req.body;

    try {
        await updateIssueItemStatus(req.params.id, req.params.itemId, status);
        res.json({ message: "Item issue status updated" });
    } catch (error) {
        console.error("Error updating item issue status:", error);
        res.status(500).json({ message: "Error updating item issue status" });
    }
});

// router.get("/issues/:id/comments", authenticateUser, async (req, res) => {
//     try {
//         const comments = await getIssueComments(req.params.id);
//         res.json({ comments });
//     } catch (err) {
//         console.error("Failed to fetch comments:", err);
//         res.status(500).json({ message: "Failed to fetch comments" });
//     }
// });

// router.post("/issues/:id/comments", authenticateUser, async (req, res) => {
//     try {
//         const { user_id, comment } = req.body;
//         const issue_id = req.params.id;
//         await addIssueComment(issue_id, user_id, comment);
//         res.status(201).json({ message: "Comment added" });
//     } catch (err) {
//         console.error("Failed to add comment:", err);
//         res.status(500).json({ message: "Failed to add comment" });
//     }
// });

module.exports = router;
