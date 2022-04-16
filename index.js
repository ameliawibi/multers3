import multer from "multer";
import express from "express";
import path from "path";
import aws from "aws-sdk";
import multerS3 from "multer-s3";

const app = express();
const s3 = new aws.S3({
  accessKeyId: process.env.ACCESSKEYID,
  secretAccessKey: process.env.SECRETACCESSKEY,
  region: "ap-southeast-1",
});
const PORT = process.env.PORT || 3005;

// Set the view engine to ejs
app.set("view engine", "ejs");
// serve static files
app.use(express.static("uploads"));

// set the name of the upload directory here
let multerUpload;
if (process.env.ENV === "PRODUCTION") {
  multerUpload = multer({
    storage: multerS3({
      s3,
      bucket: "ameliafirstbucket",
      acl: "public-read",
      contentType: multerS3.AUTO_CONTENT_TYPE,
      metadata: (request, file, callback) => {
        callback(null, { fieldName: file.fieldname });
      },
      key: (request, file, callback) => {
        callback(null, Date.now().toString());
      },
    }),
  });
} else {
  multerUpload = multer({ dest: "uploads/" });
}

app.get("/recipe", (request, response) => {
  response.render("upload");
});

app.post("/recipe", multerUpload.single("photo"), (request, response) => {
  console.log(request.file);
  response.send(request.file);
});

app.get("/uploads/:filename", (req, res) => {
  const { filename } = req.params;
  const dirname = path.resolve();
  const fullfilepath = path.join(dirname, "uploads/" + filename);
  return res.sendFile(fullfilepath);
});

app.listen(PORT);
