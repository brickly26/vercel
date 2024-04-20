import express from "express";
import cors from "cors";
import simpleGit from "simple-git";
import { generate } from "./utils";
import path from "path";
import { getAllFiles } from "./file";
import { uploadFile } from "./aws";
import { SQS } from "aws-sdk";
import dotenv from "dotenv";
import { createClient } from "redis";

dotenv.config();

if (!process.env.AWS_SQS_ACCESS_KEY_ID) {
  throw new Error("AWS_SQS_ACCESS_KEY_ID var missing");
}

if (!process.env.AWS_SQS_ACCESS_KEY) {
  throw new Error("AWS_SQS_ACCESS_KEY var missing");
}

if (!process.env.AWS_SQS_QUERY_URL) {
  throw new Error("AWS_SQS_QUERY_URL var missing");
}

if (!process.env.AWS_ELASTICACHE_URL) {
  throw new Error("AWS_ELASTICACHE_URL var missing");
}

const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const sqs = new SQS({
  accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SQS_ACCESS_KEY,
  region: "us-east-1",
});

const app = express();

app.use(cors());
app.use(express.json());

app.post("/deploy", async (req, res) => {
  const repoUrl = req.body.repoUrl;
  console.log(repoUrl);
  const id = generate();

  await simpleGit().clone(repoUrl, path.join(__dirname, `output/${id}`));

  const files = getAllFiles(path.join(__dirname, `output/${id}`));

  //put this repo to s3
  files.forEach(async (file) => {
    await uploadFile(file.slice(__dirname.length + 1), file);
  });

  await sqs
    .sendMessage({
      MessageBody: id,
      QueueUrl: process.env.AWS_SQS_QUERY_URL
        ? process.env.AWS_SQS_QUERY_URL
        : "",
    })
    .promise();

  await publisher.hSet("status", id, "uploaded");

  res.json({
    id,
  });
});

app.get("/status", async (req, res) => {
  const id = req.query.id as string;
  const response = await subscriber.hGet("status", id);
  res.json({
    status: response,
  });
});

app.listen(3000);
