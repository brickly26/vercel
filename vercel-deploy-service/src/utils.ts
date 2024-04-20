import { exec } from "child_process";
import path from "path";

export const buildProject = async (id: string) => {
  return new Promise((resolve) => {
    const child = exec(
      `cd ${path.join(
        __dirname,
        `output/${id}`
      )} && npm install && npm run build`
    );

    child.stdout?.on("data", (data) => {
      console.log("stdout: " + data);
    });
    child.stderr?.on("data", (data) => {
      console.log("what the sigma");
      console.log("stderr " + data);
    });

    child.on("close", () => {
      resolve("");
    });
  });
};
