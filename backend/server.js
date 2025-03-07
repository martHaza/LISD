const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-adminsdk.json")), 
});

app.get("/", (req, res) => {
  res.json({ message: "Inventarizācijas sistēma laboratorijām" });
});

const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});