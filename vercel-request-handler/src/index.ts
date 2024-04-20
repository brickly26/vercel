import express from "express";
import { S3 } from "aws-sdk";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.AWS_S3_ACCESS_KEY_ID) {
  throw new Error("AWS_S3_ACCESS_KEY_ID var missing");
}

if (!process.env.AWS_S3_ACCESS_KEY) {
  throw new Error("AWS_S3_ACCESS_KEY var missing");
}

const s3 = new S3({
  accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
});

const app = express();

app.get("/*", async (req, res) => {
  // id.vercel.com
  const host = req.hostname;
  const id = host.split(".")[0];
  let filePath = req.path;
  if (filePath === "/") {
    filePath = "/index.html";
  }
  const contents = await s3
    .getObject({
      Bucket: "vercel-burak",
      Key: `dist/${id}${filePath}`,
    })
    .promise();

  const type = filePath.endsWith("html")
    ? "text/html"
    : filePath.endsWith("css")
    ? "text/css"
    : "application/javascript";

  res.set("Content-Type", type);
  res.send(contents.Body);
});

app.listen(3001);
