const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// Allow both local development and your GitHub Pages deployment
const allowedOrigins = [
    "https://kowsalya280506.github.io",
    "https://online-survey-frontend-e1f1.onrender.com",
    "http://localhost:3000"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error("Blocked by CORS"));
        }
    }
}));

app.use(express.json());

// Connect to MongoDB Atlas using environment variable
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
  })
  .catch((err) => {
    console.log("MongoDB Error:", err.message);
  });

// Survey answer schema
const answerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  department: { type: String, required: true },
  programmingLanguage: { type: String, required: true },
  studyHours: { type: String, required: true },
  teachingSatisfaction: { type: String, required: true }
});

const Answer = mongoose.model("Answer", answerSchema);

// Test API
app.get("/", (req, res) => {
  res.send("Online Survey Backend is Running!");
});

// Submit survey answers
app.post("/submit", async (req, res) => {
  try {
    const answer = await Answer.create(req.body);
    res.status(201).json({
      message: "Survey submitted successfully!",
      data: answer
    });
  } catch (err) {
    console.log("Submit error:", err.message);
    res.status(400).json({
      message: "Submission failed",
      error: err.message
    });
  }
});

// Get all survey answers
app.get("/answers", async (req, res) => {
  try {
    const answers = await Answer.find();
    res.status(200).json(answers);
  } catch (err) {
    res.status(500).json({ message: "Could not fetch answers" });
  }
});

// Get one survey answer by ID
app.get("/answers/:id", async (req, res) => {
  try {
    const answer = await Answer.findById(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Survey answer not found" });
    }
    res.json(answer);
  } catch (err) {
    res.status(400).json({ message: "Invalid answer ID" });
  }
});

// Delete a survey answer
app.delete("/answers/:id", async (req, res) => {
  try {
    const answer = await Answer.findByIdAndDelete(req.params.id);
    if (!answer) {
      return res.status(404).json({ message: "Survey answer not found" });
    }
    res.json({ message: "Survey answer deleted successfully" });
  } catch (err) {
    res.status(400).json({ message: "Could not delete survey answer" });
  }
});

// Start server (supports Render's dynamic port)
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
