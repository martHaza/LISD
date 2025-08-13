const pool = require("../db");

async function getFactualLocations() {
    const [rows] = await pool.query(`
        SELECT locations.location_id, locations.room
        FROM locations
        LEFT JOIN items i ON items.factual_location_id = locations.location_id
        GROUP BY locations.location_id, locations.room
     `);
    return rows;
}

async function getJuridicalLocations() {
    const [rows] = await pool.query(`
        SELECT locations.location_id, locations.room
        FROM locations
         LEFT JOIN items i ON items.juridical_location_id = locations.location_id
        GROUP BY locations.location_id, locations.room
    `);
    return rows;
}

async function getTemporaryLocations() {
    const [rows] = await pool.query(`
        SELECT locations.location_id, locations.room
        FROM locations 
        LEFT JOIN items i ON items.temp_location_id = locations.location_id
        GROUP BY locations.location_id, locations.room
    `);
    return rows;
}

// CREATE
async function createLocation({ room }) {
    const [result] = await pool.query(
        "INSERT INTO locations (room) VALUES (?)",
        [room]
    );
    return { location_id: result.insertId, room };
}

// UPDATE
async function updateLocation(id, { room }) {
    await pool.query(
        "UPDATE locations SET room = ? WHERE location_id = ?",
        [room, id]
    );
}

// DELETE
async function deleteLocation(id) {
    await pool.query("DELETE FROM locations WHERE location_id = ?", [id]);
}

module.exports = {
    getFactualLocations,
    getJuridicalLocations,
    getTemporaryLocations,
    createLocation,
    updateLocation,
    deleteLocation
};