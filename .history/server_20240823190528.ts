import express from 'express';
import * as fs from 'fs-extra';
import * as path from 'path';
import simpleGit from 'simple-git';

const app = express();
const port = 3000;
const git = simpleGit();
const cloneDir = 'repo_clone';

app.use(express.static('public'));

app.get('/structure', async (req, res) => {
    const repoUrl = req.query.url as string;

    if (!repoUrl) {
        return res.status(400).json({ error: 'Repository URL is required.' });
    }

    try {
        // Remove existing directory if it exists
        if (fs.existsSync(cloneDir)) {
            console.log(`Removing existing directory: ${cloneDir}`);
            fs.removeSync(cloneDir);
        }

        console.log(`Cloning repository from ${repoUrl}...`);
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

        const structure = getDirectoryStructure(cloneDir);
        fs.removeSync(cloneDir);

        res.json(structure);
    } catch (error) {
        console.error('Detailed error:', error);  // Log detailed error for debugging
        res.status(500).json({ error: 'Error cloning repository or retrieving structure.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
