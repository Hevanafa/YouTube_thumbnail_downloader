import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import { existsSync, mkdir } from "node:fs";
import { readdir } from "node:fs/promises";

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

app.use("/thumbs", express.static("thumbs"));

app.get("/api/thumbnails", async (req, res) => {
  const files = await readdir("./thumbs");
  res.json({ files })
});

async function downloadAndSave(thumbHref: string, outFilename: string): Promise<[boolean, string]> {
  const outFilepath = "thumbs/" + outFilename;

  try {
    const thumbResponse = await fetch(thumbHref);
    const arrayBuffer = await thumbResponse.arrayBuffer();

    await Bun.write(outFilepath, arrayBuffer);
  } catch (error) {
    if (error instanceof Error)
      return [false, error.message];
  }

  return [true, outFilepath]
}

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

  // Fetch the page
  const response = await fetch(url);
  const html = await response.text();
  const cheer = cheerio.load(html);
  const title = cheer("title").text();

  // Download the thumbnail
  if (!existsSync("./thumbs")) mkdir("thumbs", () => {});

  const youtubeHash = new URL(url).searchParams.get("v") ?? "";

  if (youtubeHash == "") {
    res.status(400);
    res.json({ success: false, message: "Missing video hash!" });
    return
  }

  const thumbHref = cheer("link[itemprop=\"thumbnailUrl\"]").attr("href")!;
  console.log("Thumbnail URL:", thumbHref);

  const match = thumbHref.match(/\.(jpg|png)$/);
  const ext = match?.[1] ?? "";
  const outFilename = `${youtubeHash}.${ext}`;

  const downloadResponse = await downloadAndSave(thumbHref, outFilename);
  if (downloadResponse[0] == true)
    res.json({
      success: true,
      url,
      title,
      outFilename,
      message: "Saved as " + downloadResponse[1]
    })
  else {
    res.status(409);
    res.json({ success: false, message: downloadResponse[1] })
  }
});
