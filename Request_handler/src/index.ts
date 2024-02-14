import express from 'express'
import { S3 } from 'aws-sdk';

const app = express();

const PORT = process.env.PORT || 3001

const s3 = new S3({
    accessKeyId: "",
    secretAccessKey: "",
    endpoint: ""
})

app.get('/*',async (req,res) => {
    const hostname = req.hostname;
    const id = hostname.split('.')[0];
    console.log(id);
    const filePath = req.route;
    const contents = await s3.getObject({
        Bucket: "CodePulse",
        Key: `dist/${id}/{filePath}`
    }).promise();

    const type = filePath.endsWith("html") ? "text/html" : filePath.endsWith("css") ? "text/css" : "application/javascript"
    res.set("Content-Type",type);

    res.send(contents.Body)
})

app.listen(PORT,() => {
    console.log(`Request Server running at ${PORT}`);
})