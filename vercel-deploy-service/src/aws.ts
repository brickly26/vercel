import { S3 } from "aws-sdk";
import fs from "fs";
import dotenv from "dotenv";
import path from "path";

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

export const downloadS3Folder = async (prefix: string) => {
  console.log(prefix);
  const allFiles = await s3
    .listObjectsV2({
      Bucket: "vercel-burak",
      Prefix: prefix,
    })
    .promise();

  const allPromises =
    allFiles.Contents?.map(async ({ Key }) => {
      return new Promise(async (resolve) => {
        if (!Key) {
          resolve("");
          return;
        }
        const finalOutputPath = path.join(__dirname, Key);
        const outputFile = fs.createWriteStream(finalOutputPath);
        const dirName = path.dirname(finalOutputPath);
        if (!fs.existsSync(dirName)) {
          fs.mkdirSync(dirName, { recursive: true });
        }
        s3.getObject({
          Bucket: "vercel-burak",
          Key,
        })
          .createReadStream()
          .pipe(outputFile)
          .on("finish", () => {
            resolve("");
          });
      });
    }) || [];

  await Promise.all(allPromises?.filter((x) => x !== undefined));
};
