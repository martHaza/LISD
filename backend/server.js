import https from "https";
import fs from "fs";
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import admin from "firebase-admin";
import dotenv from "dotenv";

dotenv.config();


import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import userRolesRoutes from "./routes/userRolesRoutes.js";
import rolesRoutes from "./routes/rolesRoutes.js";
import localUserRoutes from "./routes/localUserRoutes.js";
import itemRoutes from "./routes/itemRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import locationRoutes from "./routes/locationRoutes.js";
import inventoryRequestRoutes from "./routes/inventoryRequestRoutes.js";
import transferRequestRoutes from "./routes/transferRequestRoutes.js";
import issueRoutes from "./routes/issueRoutes.js";
import itemReservationRoutes from "./routes/itemReservationRoutes.js";

const serviceAccount = JSON.parse(
  fs.readFileSync(new URL("./firebase-adminsdk.json", import.meta.url))
);

const app = express();
app.use(cors());
app.use(bodyParser.json());

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount), 
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
app.use("/api", issueRoutes);
app.use("/api", itemReservationRoutes);
app.use("/api", inventoryRequestRoutes);
app.use("/api", transferRequestRoutes);


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