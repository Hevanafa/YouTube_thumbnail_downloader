import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";

const app = express();
const Port = 8001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello from Bun + Express!" })
});

app.listen(Port, () => {
  console.log("Server running on localhost:" + Port);
});

app.post("/api/download", async (req, res) => {
  const { url } = <{ url: string }> req.body;

  console.log("Received URL:", url);

  try {
    new URL(url);
  } catch (error) {
    throw error
  }

  if (!url.includes("youtube.com"))
    throw new Error("Invalid YouTube URL!");

  const response = await fetch(url);
  const html = await response.text();
  const cheer = cheerio.load(html);

  const title = cheer("title").text();
  console.log("Title:", title);

  res.json({ success: true, url })
});
