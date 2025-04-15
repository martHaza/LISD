const pool = require("../db");

async function getItemByItemNumber(itemId) {
    const [rows] = await pool.query(`
        SELECT items.item_number, items.title, users.email
        FROM items
        LEFT JOIN users ON items.user_id = users.user_id
        WHERE items.item_number = ?
        ;
    `, [itemId]);
    return rows[0] || null;
}

module.exports = {
    getItemByItemNumber
};
