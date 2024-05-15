import express, { Application, NextFunction, Request, Response } from 'express';
import http from 'http';
import multer from 'multer';
import {
  ClerkExpressRequireAuth,
  RequireAuthProp,
  StrictAuthProp,
} from '@clerk/clerk-sdk-node';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

const bucketName = process.env.AWS_BUCKET_NAME!;
const bucketRegion = process.env.AWS_BUCKET_REGION!;
const awsAccessKey = process.env.AWS_ACCESS_KEY_IAM!;
const awsSecretAccessKey = process.env.AWS_SECRET_ACCESS_KEY!;

const s3 = new S3Client({
  credentials: {
    accessKeyId: awsAccessKey,
    secretAccessKey: awsSecretAccessKey,
  },
  region: bucketRegion
});

const PORT = process.env.PORT || 3000;
const app: Application = express();

declare global {
  namespace Express {
    interface Request extends StrictAuthProp { }
  }
}

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Enable CORS for the specific route
const allowCors = (fn: any) => async (req: Request, res: Response) => {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  // another common pattern
  // res.setHeader('Access-Control-Allow-Origin', req.headers.origin);
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  return await fn(req, res);
};

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const uploadHandler = async (req: RequireAuthProp<Request>, res: Response) => {
  const files = req.files as Express.Multer.File[];
  const uploadResults = [];
  console.log(req.auth);

  for (const file of files) {
    const params = {
      Bucket: bucketName,
      Key: file.originalname,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const command = new PutObjectCommand(params);

    try {
      const data = await s3.send(command);
      uploadResults.push(data);
      console.log(data);
    } catch (error) {
      console.error(error);
      res.status(500).send("Error uploading files");
      return;
    }
  }

  res.send("Files uploaded successfully");
};

app.post("/api/upload", ClerkExpressRequireAuth(), upload.array("files", 12), allowCors(uploadHandler));

const server: http.Server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
