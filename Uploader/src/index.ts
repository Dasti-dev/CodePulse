import express from 'express';
import cors from 'cors';
import simpleGit from 'simple-git';
import { generate } from './utils';
import path from 'path';
import { getAllFiles } from './file';
import { uploadFile } from './aws';
import { createClient } from 'redis';

const publisher = createClient();
publisher.connect();

const subscriber = createClient();
subscriber.connect();

const app = express();

app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

app.post("/deploy", async (req,res) => {
    const repoURL = req.body.repoURL;
    const id = generate();
    await simpleGit().clone(repoURL,path.join(__dirname,`./output/${id}`));
    const files = getAllFiles(path.join(__dirname,`output/${id}`));

    files.forEach(async file => {
        await uploadFile(file.slice(__dirname.length + 1), file);
    })

    publisher.lPush("build-queue",id);
    publisher.hSet("status", id, "uploaded");

    res.status(200).json({
        id:id
    })
})

app.get('/status', async (req,res) => {
    const id = req.query.id;
    const response = await subscriber.hGet("status", id as string);
    res.json({
        status: response
    })
})

app.listen(PORT,()=>{
    console.log(`Server running at ${PORT}`);
})