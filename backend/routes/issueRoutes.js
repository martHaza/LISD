import express from "express";
const router = express.Router();
import {
    createIssue,
    getIssues,
    getIssueById,
    updateIssueStatus,
    getIssueComments,
    addIssueComment
} from "../services/issueService.js";

import { authenticateUser, authorizeRole } from "../middleware/authMiddleware.js";

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
        const comments = await getIssueComments(issue.issue_id);
        res.json({ issue, comments });
    } catch (error) {
        console.error("Error fetching issue:", error);
        res.status(500).json({ message: "Error fetching issue" });
    }
});

router.post("/issues", authenticateUser, authorizeRole(["lietotājs", "laborants", "materiāli atbildīgā persona"]), async (req, res) => {
    try {
        const { item_id, reported_by, status, description } = req.body;
        const { issue_id } = await createIssue({ item_id, reported_by, status, description });
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

router.get("/issues/:id/comments", authenticateUser, async (req, res) => {
    try {
        const comments = await getIssueComments(req.params.id);
        res.json({ comments });
    } catch (error) {
        console.error("Failed to fetch comments:", error);
        res.status(500).json({ message: "Failed to fetch comments" });
    }
});

router.post("/issues/:id/comments", authenticateUser, authorizeRole(["laborants", "materiāli atbildīgā persona"]), async (req, res) => {
    try {
        const { user_id, comment } = req.body;
        const issue_id = req.params.id;
        await addIssueComment(issue_id, user_id, comment);
        res.status(201).json({ message: "Comment added" });
    } catch (err) {
        console.error("Failed to add comment:", err);
        res.status(500).json({ message: "Failed to add comment" });
    }
});

export default router;
