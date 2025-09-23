import pool from "../db.js";

async function getItemRequests() {
  const result = await pool.query(
    `SELECT item_request_id, user_id, reason, status, created_at
     FROM item_requests
     ORDER BY created_at DESC`
  );
  return result.rows;
}

async function getItems() {
  const result = await pool.query(
    `SELECT  items.item_id, items.title, locations.room as factual_location_room
    FROM items 
    LEFT JOIN locations ON items.factual_location_id = locations.location_id
    ORDER BY items.title`
  );
  return result.rows;
}

async function getItemRequestById(requestId) {
  const result = await pool.query(
    `SELECT item_request_id, user_id, reason, status, created_at
     FROM item_requests
     WHERE item_request_id = $1`,
    [requestId]
  );
  return result.rows[0];
}

async function createItemRequest({ user_id, reason, status }) {
  const result = await pool.query(
    `INSERT INTO item_requests (user_id, reason, status)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [user_id, reason, status]
  );
  return result.rows[0];
}

async function createItemReservation({ user_id, request_id, from_time, to_time }) {
  const result = await pool.query(
    `INSERT INTO item_reservation (user_id, request_id, from_time, to_time)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [user_id, request_id, from_time, to_time]
  );
  return result.rows[0];
}

async function getItemReservationsForRequest(requestId) {
  const result = await pool.query(
    `SELECT item_reservation_id, user_id, request_id, from_time, to_time, created_at
     FROM item_reservation
     WHERE request_id = $1`,
    [requestId]
  );
  return result.rows;
}

export { 
  getItems, 
  getItemRequests, 
  getItemRequestById, 
  createItemRequest, 
  createItemReservation, 
  getItemReservationsForRequest 
};