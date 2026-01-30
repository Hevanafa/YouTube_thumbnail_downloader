import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import { existsSync, mkdir } from "node:fs";
import { URLSearchParams } from "node:url";

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
    if (error instanceof Error) {
      res.status(400);
      res.json({ success: false, message: error.message });
    }
    return
  }

  if (!url.includes("youtube.com")) {
    res.status(400);
    res.json({ success: false, message: "Invalid YouTube URL!" });
    return
  }

  // Fetch the thumbnail
  const response = await fetch(url);
  const html = await response.text();
  const cheer = cheerio.load(html);

  const title = cheer("title").text();
  console.log("Title:", title);

  const href = cheer("link[itemprop=\"thumbnailUrl\"]").attr("href")!;
  console.log("Thumbnail URL:", href);

  const youtubeHash = new URLSearchParams(url).get("v") ?? "";
  let ext = "";
  href.match(/\.(jpg|png)$/, (_, g1) => ext = g1);
  const outFilename = `thumbs/${youtubeHash}.${ext}`;
  
  if (!existsSync("./thumbs")) mkdir("thumbs", () => {});





  res.json({ success: true, url, title })
});
