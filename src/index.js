const express = require("express");

// Loading config files
const dotenv = require("dotenv");
dotenv.config({ path: "../.env" });

const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const artistRoutes = require("./routes/artist");
const albumRoutes = require("./routes/album");
const trackRoutes = require("./routes/track");
const favoriteRoutes = require("./routes/favorite");

const database = require("./config/database");

const app = express();

app.use(express.json());

const PORT = process.env.PORT;

app.use(express.json());

// Connectig database
database.connect();

// Routes
app.use("/api/v1/", authRoutes);
app.use("/api/v1/", userRoutes);
app.use("/api/v1/", artistRoutes);
app.use("/api/v1/", albumRoutes);
app.use("/api/v1/", trackRoutes);
app.use("/api/v1/", favoriteRoutes);

app.listen(PORT, () => {
  console.log(`App is running at ${PORT}`);
});
