import { S3 } from "aws-sdk";

// const s3 = new S3({
//   accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
// });

// export const downloadS3Folder = async (prefix: string) => {
//   console.log(prefix);
//   const allFiles = await s3
//     .listObjectsV2({
//       Bucket: "vercel-burak",
//       Prefix: prefix,
//     })
//     .promise();

//   const allPromises = allFiles.Contents?.map(async ({ Key }) => {
//     if (!Key) {
//       return;
//     }
//     const file = await s3
//       .getObject({
//         Bucket: "vercel-burak",
//         Key,
//       })
//       .promise();
//     var outputFile = fs.createWriteStream("/path/to/file.jpg");
//     s3.getObject();
//   });

//   await Promise.all(allPromises?.filter((x) => x !== undefined));
// };
