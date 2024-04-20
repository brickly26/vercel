import { S3 } from "aws-sdk";
import dotenv from "dotenv";
import fs from "fs";

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

export const uploadFile = async (fileName: string, localFilePath: string) => {
  const fileContent = fs.readFileSync(localFilePath);
  const response = await s3
    .upload({
      Body: fileContent,
      Bucket: "vercel-burak",
      Key: fileName,
    })
    .promise();
};
