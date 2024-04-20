"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const aws_sdk_1 = require("aws-sdk");
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
if (!process.env.AWS_S3_ACCESS_KEY_ID) {
    throw new Error("AWS_S3_ACCESS_KEY_ID var missing");
}
if (!process.env.AWS_S3_ACCESS_KEY) {
    throw new Error("AWS_S3_ACCESS_KEY var missing");
}
const s3 = new aws_sdk_1.S3({
    accessKeyId: process.env.AWS_S3_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_S3_ACCESS_KEY,
});
const app = (0, express_1.default)();
app.get("/*", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    // id.vercel.com
    const host = req.hostname;
    const id = host.split(".")[0];
    console.log(id);
    let filePath = req.path;
    console.log("filepath", filePath);
    if (filePath === "/") {
        filePath = "/index.html";
    }
    const contents = yield s3
        .getObject({
        Bucket: "vercel-burak",
        Key: `dist/${id}${filePath}`,
    })
        .promise();
    const type = filePath.endsWith("html")
        ? "text/html"
        : filePath.endsWith("css")
            ? "text/css"
            : "application/javascript";
    res.set("Content-Type", type);
    res.send(contents.Body);
}));
app.listen(3001);
