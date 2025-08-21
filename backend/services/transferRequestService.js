const pool = require("../db");

async function getTransfers() {
  const result = await db.query(
    `SELECT transfer_id, request_id, item_id, transfer_type, 
            from_location, to_location, reason, from_time, to_time, created_at
     FROM transfers
     ORDER BY created_at DESC`
  );
  return result.rows;
}

async function getTransferById(id) {
  const result = await db.query(
    `SELECT transfer_id, request_id, item_id, transfer_type, 
            from_location, to_location, reason, from_time, to_time, created_at
     FROM transfers
     WHERE transfer_id = $1`,
    [id]
  );
  return result.rows[0];
}

async function createTransfer({
  request_id,
  item_id,
  transfer_type,
  from_location,
  to_location,
  reason,
  from_time,
  to_time
}) {
  const result = await db.query(
    `INSERT INTO transfers
       (request_id, item_id, transfer_type, from_location, to_location, reason, from_time, to_time)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING transfer_id`,
    [
      request_id,
      item_id,
      transfer_type,
      from_location,
      to_location,
      reason,
      from_time,
      to_time
    ]
  );
  return result.rows[0];
}

async function updateTransfer(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return null;

  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
  const values = Object.values(fields);

  const result = await db.query(
    `UPDATE transfers SET ${setClause} WHERE transfer_id = $${
      keys.length + 1
    } RETURNING *`,
    [...values, id]
  );

  return result.rows[0];
}

async function deleteTransfer(id) {
  await db.query(`DELETE FROM transfers WHERE transfer_id = $1`, [id]);
  return { message: "Transfer deleted" };
}

module.exports = {
  getTransfers,
  getTransferById,
  createTransfer,
  updateTransfer,
  deleteTransfer,
};