import pool from "../db.js";

async function createItemReservation({ item_id, request_id, from_time, to_time }) {
  const result = await db.query(
    `INSERT INTO item_reservation (item_id, request_id, from_time, to_time, created_at)
     VALUES (?, ?, ?, ?, NOW())
     RETURNING item_reservation_id`,
    [item_id, request_id, from_time, to_time]
  );
  return result.rows[0];
}

async function getItemReservations() {
  const result = await db.query("SELECT * FROM item_reservation ORDER BY created_at DESC");
  return result.rows;
}

async function getItemReservationById(id) {
  const result = await db.query("SELECT * FROM item_reservation WHERE item_reservation_id = $1", [id]);
  return result.rows[0];
}

async function updateItemReservation(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = Object.values(fields);

  const result = await db.query(
    `UPDATE item_reservation SET ${setClause} WHERE item_reservation_id = $${keys.length + 1} RETURNING *`,
    [...values, id]
  );

  return result.rows[0];
}

async function deleteItemReservation(id) {
  const result = await db.query("DELETE FROM item_reservation WHERE item_reservation_id = $1 RETURNING *", [id]);
  return result.rows[0];
}

export {
  createItemReservation,
  getItemReservations,
  getItemReservationById,
  updateItemReservation,
  deleteItemReservation
};
