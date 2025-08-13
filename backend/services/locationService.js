const pool = require("../db");

async function getFactualLocations() {
    const [rows] = await pool.query(`
        SELECT locations.locations_id, locations.room
        FROM locations
        LEFT JOIN items i ON items.factual_location_id = locations.location_id
        GROUP BY locations.location_id, locations.room
     `);
    return rows;
}

async function getJuridicalLocations() {
    const [rows] = await pool.query(`
        SELECT locations.locations_id, locations.room
        FROM locations
         LEFT JOIN items i ON items.juridical_location_id = locations.location_id
        GROUP BY locations.location_id, locations.room
    `);
    return rows;
}

async function getTemporaryLocations() {
    const [rows] = await pool.query(`
        SELECT lpcations.location_id, locations.room
        FROM locations 
        LEFT JOIN items i ON items.temp_location_id = locations.location_id
        GROUP BY locations.location_id, locations.room
    `);
    return rows;
}

module.exports = {
    getFactualLocations,
    getJuridicalLocations,
    getTemporaryLocations
};