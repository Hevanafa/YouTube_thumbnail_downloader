import express from "express";

const app = express();
const Port = 8001;

app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Hello from Bun + Express!" })
});

app.listen(Port, () => {
  console.log("Server running on localhost:" + Port);
});

app.post("/api/download", async (req, res) => {
  const { url } = req.body;

  console.log("Received URL:", url);

  // TODO: Download the thumbnail

  res.json({ success: true, url })
});
