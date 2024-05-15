import express, { Application, NextFunction, Request, Response } from 'express';
import http from 'http';
import cors from 'cors'; // Import the cors package
import multer from 'multer';
import {
  ClerkExpressRequireAuth,
  RequireAuthProp,
  StrictAuthProp,
} from '@clerk/clerk-sdk-node';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const bucketName = process.env.AWS_BUCKET_NAME!
const bucketRegion = process.env.AWS_BUCKET_REGION!
const awsAccessKey = process.env.AWS_ACCESS_KEY_IAM!
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretAccessKey,
  },
  region: bucketRegion
})

const PORT = process.env.PORT || 3000;
const app: Application = express();


declare global {
  namespace Express {
    interface Request extends StrictAuthProp { }
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });



app.use(cors()); // Enable CORS for all requests

// Parse URL-encoded and JSON request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// This function will be your route handler
app.post("/api/upload", ClerkExpressRequireAuth(), upload.array("files", 12), async (req: RequireAuthProp<Request>, res: Response) => {
  const files = req.files as Express.Multer.File[];  // Ensure 'files' is treated as an array of files
  const uploadResults = [];
  console.log(req.auth);
  

  for (const file of files) {
    const params = {
      Bucket: bucketName,  // Ensure your bucket name is defined or configured properly
      Key: file.originalname,  // Use the original file name as the key in S3
      Body: file.buffer,  // Use the buffer that multer provides
      ContentType: file.mimetype  // Set the correct MIME type
    };

    const command = new PutObjectCommand(params);

    try {
      const data = await s3.send(command);  // Send the command to S3
      uploadResults.push(data);
      console.log(data);  // Optionally log the success for each file
    } catch (error) {
      console.error(error);  // Log any errors that occur
      res.status(500).send("Error uploading files");  // Send an error response if something goes wrong
      return;
    }
  }

  res.send("Files uploaded successfully");  // Confirm all files were uploaded
});


const server: http.Server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});