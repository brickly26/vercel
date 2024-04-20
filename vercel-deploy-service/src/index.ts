import { SQS } from "aws-sdk";
import dotenv from "dotenv";
import { downloadS3Folder, uploadFinalBuild } from "./aws";
import { buildProject } from "./utils";
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

const sqs = new SQS({
  accessKeyId: process.env.AWS_SQS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SQS_ACCESS_KEY,
  region: "us-east-1",
});

if (!process.env.AWS_ELASTICACHE_URL) {
  throw new Error("AWS_ELASTICACHE_URL var missing");
}

const redis = createClient();

redis.connect();

async function main() {
  while (true) {
    await sqs
      .receiveMessage(
        {
          QueueUrl: process.env.AWS_SQS_QUERY_URL
            ? process.env.AWS_SQS_QUERY_URL
            : "",
        },
        async (err, { Messages }) => {
          if (err) {
            console.log(err);
          }
          if (Messages && Messages[0]) {
            // download files from s3
            const id = Messages[0].Body as string;

            await downloadS3Folder(`output/${id}`);
            await buildProject(id);
            await uploadFinalBuild(id);

            await redis.hSet("status", id, "deployed");

            await sqs
              .deleteMessage({
                QueueUrl: process.env.AWS_SQS_QUERY_URL
                  ? process.env.AWS_SQS_QUERY_URL
                  : "",
                ReceiptHandle: Messages[0].ReceiptHandle as string,
              })
              .promise();
          }
        }
      )
      .promise();
  }
}

main();
