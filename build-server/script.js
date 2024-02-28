const { exec } = require("child_process");
const path = require("path");
const fs = require("fs");
const { s3Client, PutObjectCommand } = require("@aws-sdk/client-s3");
const mime = require("mime-types");

const s3Client = new s3Client({
  region: "",
  credentials: {
    accessKeyId: "",
    secretAccessKey: "",
  },
});

const PROJECT_ID = process.env.PROJECT_ID;

async function init() {
  console.log("Executing script.js");
  const outDirPath = path.join(__dirname, "output");

  //this command'll locate the cloned code directory then execute npm install and npm run build
  const p = exec(`cd ${outDirPath} && npm install && npm run build`);

  //tracking the output while executing the above command
  p.stdout.on("data", function (data) {
    console.log(data.toString());
  });
  p.stderr.on("data", function (data) {
    console.log(data.toString());
  });
  p.on("exit", function () {
    console.log("done!");
  });

  //track errors
  p.stdout.on("error", function (data) {
    console.log("Error", data.toString());
  });

  //on build completion
  p.on("close", async function () {
    console.log("Build Completed");

    //build contents resides in dist folder
    const distFolderPath = path.join(__dirname, "output", "dist");
    //array of files in dist folder
    const distFolderContents = fs.readdirSync(distFolderPath, {
      recursive: true,
    });

    //iterate file by file
    for (const filePath of distFolderContents) {
      if (fs.lstatSync(filePath).isDirectory()) continue;

      //command
      const command = new PutObjectCommand({
        Bucket: "",
        Key: `_outputs/${PROJECT_ID}/${filePath}`,
        Body: fs.createReadStream(filePath),
        ContentType: mime.lookup(filePath),
      });

      //send command: uploads objects in aws s3 bucket
      await s3Client.send(command);
    }

    console.log("done...")
  });
}
