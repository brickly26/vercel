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

export const uploadFinalBuild = async (id: string) => {
  const folderPath = path.join(__dirname, `output/${id}/dist`);
  const allFiles = getAllFiles(folderPath);
  allFiles.forEach(async (file) => {
    await uploadFile(`dist/${id}/` + file.slice(folderPath.length + 1), file);
  });
};

export const getAllFiles = (folderPath: string) => {
  let response: string[] = [];

  const allFilesandFolder = fs.readdirSync(folderPath);
  allFilesandFolder.forEach((file) => {
    const fullFolderPath = path.join(folderPath, file);

    if (fs.statSync(fullFolderPath).isDirectory()) {
      response = response.concat(getAllFiles(fullFolderPath));
    } else {
      response.push(fullFolderPath);
    }
  });
  return response;
};

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
