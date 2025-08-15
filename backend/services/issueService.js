const pool = require("../db");

async function createIssue({ item_id, reported_by, status, description }) {
    const [result] = await pool.query(`
        INSERT INTO issues (item_id, reported_by, status, description, created_at)
        VALUES (?, ?, ?, ?, NOW())
    `, [item_id, reported_by, status, description]);

    return { issue_id: result.insertId };
}

async function getIssues() {
    const [rows] = await pool.query(`
        SELECT issues.issue_id, issues.item_id, items.item_number, items.title AS item_title, issues.reported_by,
               users.email AS reported_by_email, issues.status, issues.description, issues.created_at
        FROM issues 
        JOIN items ON issues.item_id = items.item_id
        JOIN users ON issues.reported_by = users.user_id
        ORDER BY issues.created_at DESC
    `);
    return rows;
}

async function getIssueById(issue_id) {
    const [rows] = await pool.query(`
        SELECT * FROM issues WHERE issue_id = ?
    `, [issue_id]);
    return rows[0] || null;
}

async function updateIssueStatus(issue_id, status) {
    await pool.query(`
        UPDATE issues
        SET status = ?, updated_at = NOW()
        WHERE issue_id = ?
    `, [status, issue_id]);
}

async function getIssueComments(issue_id) {
    const [rows] = await pool.query(`
        SELECT issue_comments.issue_comment_id,
               issue_comments.comment,
               issue_comments.created_at,
               users.email AS commented_by
        FROM issue_comments
        JOIN users ON issue_comments.user_id = users.user_id
        WHERE issue_comments.issue_id = ?
        ORDER BY issue_comments.created_at ASC
    `, [issue_id]);
    return rows;
}

async function addIssueComment(issue_id, user_id, comment) {
    await pool.query(`
        INSERT INTO issue_comments (issue_id, user_id, comment, created_at)
        VALUES (?, ?, ?, NOW())
    `, [issue_id, user_id, comment]);
}

module.exports = {
    createIssue,
    getIssues,
    getIssueById,
    updateIssueStatus,
    getIssueComments,
    addIssueComment
};
