import { S3 } from "aws-sdk";
import fs from "fs";

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
