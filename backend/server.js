const https = require("https");
const fs = require("fs");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const admin = require("firebase-admin");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const userRolesRoutes = require("./routes/userRolesRoutes");
const rolesRoutes = require("./routes/rolesRoutes");
const localUserRoutes = require("./routes/localUserRoutes");
const itemRoutes = require("./routes/itemRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const locationRoutes = require("./routes/locationRoutes");

const app = express();
app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(require("./firebase-adminsdk.json")), 
});

app.get("/", (req, res) => {
  res.json({ message: "Inventarizācijas sistēma laboratorijām" });
});

app.get('/api/items', (req, res, next) => {
  console.log('GET /items hit!');
  next();
});

app.use("/", authRoutes);
app.use("/api", userRoutes);
app.use("/api", userRolesRoutes);
app.use("/api", rolesRoutes);
app.use("/api", localUserRoutes);
app.use("/api", itemRoutes);
app.use("/api", locationRoutes);

app.use('/uploads', express.static('uploads'));
app.use("/api", uploadRoutes);

const httpsOptions = {
  key: fs.readFileSync(process.env.SSL_KEY_PATH),
  cert: fs.readFileSync(process.env.SSL_CERT_PATH),
};

const PORT = 3000;
https.createServer(httpsOptions, app).listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});