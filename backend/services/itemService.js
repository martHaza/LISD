const pool = require("../db");

async function getItemByItemNumber(itemId) {
    const [rows] = await pool.query(`
        SELECT items.item_number, items.title, items.description, users.email, locations.room
        FROM items
        LEFT JOIN users ON items.user_id = users.user_id
        LEFT JOIN locations ON items.factual_location_id = locations.location_id
        WHERE items.item_number = ?
        ;
    `, [itemId]);
    return rows[0] || null;
}

async function getAllItems() {
    const [rows] = await pool.query(`
        SELECT items.item_number, items.title, items.code, items.description, items.exploitation_date, locations.room
        FROM items
        LEFT JOIN locations ON items.factual_location_id = locations.location_id;
    `);
    return rows;
}

module.exports = {
    getItemByItemNumber
};
