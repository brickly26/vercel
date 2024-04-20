import { SQS } from "aws-sdk";
import dotenv from "dotenv";
// import { downloadS3Folder } from "./aws";

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

async function main() {
  while (true) {
    await sqs
      .receiveMessage(
        {
          QueueUrl: process.env.AWS_SQS_QUERY_URL || "",
        },
        async (err, { Messages }) => {
          if (err) {
            console.log(err);
          }
          if (Messages && Messages[0]) {
            // download files from s3
            // await downloadS3Folder(`output/${Messages[0].Body}`);
            console.log(Messages[0].Body);

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
