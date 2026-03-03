const express = require("express");
const puppeteer = require("puppeteer");
const { createCanvas, loadImage } = require("canvas");

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/generate", async (req, res) => {
  const { url } = req.body;

  const browser = await puppeteer.launch({
    args: ["--no-sandbox", "--disable-setuid-sandbox"]
  });

  const page = await browser.newPage();
  await page.goto(url, { waitUntil: "networkidle2" });

  const screenshot = await page.screenshot({ fullPage: true });

  await browser.close();

  const image = await loadImage(screenshot);
  const canvas = createCanvas(image.width, image.height + 60);
  const ctx = canvas.getContext("2d");

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, image.width, 60);

  const now = new Date();
  const formatted =
    String(now.getDate()).padStart(2, "0") + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    now.getFullYear() + " | " +
    now.toLocaleTimeString();

  ctx.fillStyle = "#000000";
  ctx.font = "20px Arial";
  ctx.textAlign = "center";
  ctx.fillText(
    "Receipt Date and Time: " + formatted,
    image.width / 2,
    35
  );

  ctx.drawImage(image, 0, 60);

  res.setHeader("Content-Type", "image/png");
  res.send(canvas.toBuffer());
});

app.listen(3000, () => console.log("Server running on port 3000"));
