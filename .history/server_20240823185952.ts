import express from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit from 'simple-git';

const app = express();
const port = 3000;
const git = simpleGit();

app.use(express.static('public'));

app.get('/structure', async (req, res) => {
    const repoUrl = req.query.url as string;
    const cloneDir = 'repo_clone';

    if (!repoUrl) {
        return res.status(400).send('Repository URL is required.');
    }

    try {
        await git.clone(repoUrl, cloneDir);

        const getDirectoryStructure = (dir: string): any => {
            const entries = fs.readdirSync(dir);
            return entries.map(entry => {
                const fullPath = path.join(dir, entry);
                if (fs.statSync(fullPath).isDirectory()) {
                    return {
                        name: entry,
                        type: 'directory',
                        children: getDirectoryStructure(fullPath)
                    };
                } else {
                    return {
                        name: entry,
                        type: 'file'
                    };
                }
            });
        };

 