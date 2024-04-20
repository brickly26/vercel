import fs from "fs";
import path from "path";

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
