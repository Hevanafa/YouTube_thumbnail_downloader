import express from "express";
import cors from "cors";
import * as cheerio from "cheerio";
import { existsSync, mkdir } from "node:fs";
// import { readdir } from "node:fs/promises";
import * as db from "./db";

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
  // const files = await readdir("./thumbs");
  // res.json({ files })

  const thumbnails = db.instance.query(
    "SELECT id as thumbnailId, title, filename FROM thumbnails"
  ).all();
  res.json({ thumbnails })
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

  if (!url.includes("youtube.com") && !url.includes("youtu.be")) {
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

  const urlObj = new URL(url);
  let videoID = "";

  if (urlObj.hostname == "youtu.be")
    videoID = urlObj.pathname.substring(1)
  else if (urlObj.pathname.includes("shorts"))
    videoID = urlObj.pathname.substring(1).split("/")[1] ?? ""
  else
    videoID = new URL(url).searchParams.get("v") ?? "";

  if (videoID == "") {
    res.status(400);
    res.json({ success: false, message: "Missing video ID!" });
    return
  }

  const thumbHref = cheer("link[itemprop=\"thumbnailUrl\"]").attr("href")!;
  const thumbPathname = new URL(thumbHref).pathname;

  console.log("Thumbnail URL:", thumbHref);

  const match = thumbPathname.match(/\.(jpg|png)$/);
  const ext = match?.[1] ?? "";
  const outFilename = `${videoID}.${ext}`;

  const downloadResponse = await downloadAndSave(thumbHref, outFilename);

  if (downloadResponse[0] == true) {
    const existing = <{id: number}> db.instance.query(
      "SELECT id FROM thumbnails WHERE filename = ?"
    ).get(outFilename);

    console.log("existing", existing);

    if (existing != null)
      res.json({
        success: true,
        url,
        message: "File already exists in the database. Thumbnail has been downloaded again",

        duplicate: true,
        thumbnailId: existing.id,
        title,
        filename: outFilename
      })
    else {
      const result = db.instance.run(
        "INSERT INTO thumbnails (title, filename) VALUES (?, ?)",
        [title, outFilename]);

      res.json({
        success: true,
        url,
        message: "Saved as " + downloadResponse[1],

        duplicate: false,
        thumbnailId: result.lastInsertRowid,
        title,
        filename: outFilename
      })
    }
  } else {
    res.status(409);
    res.json({ success: false, message: downloadResponse[1] })
  }
});

db.initDatabase();
