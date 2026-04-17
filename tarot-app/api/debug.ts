import fs from 'fs';
import path from 'path';

export default async function handler(req: any, res: any) {
  try {
    const taskDir = '/var/task';
    const apiDir = path.join(taskDir, 'tarot-app', 'api');
    
    let files: string[] = [];
    try { files = fs.readdirSync(apiDir); } catch(e) {}
    
    let taskFiles: string[] = [];
    try { taskFiles = fs.readdirSync(taskDir); } catch(e) {}
    
    let tarotFiles: string[] = [];
    try { tarotFiles = fs.readdirSync(path.join(taskDir, 'tarot-app')); } catch(e) {}
    
    return res.status(200).json({ 
      taskDir: taskFiles,
      tarotAppDir: tarotFiles,
      apiDir: files,
      cwd: process.cwd(),
      dirname: path.dirname(new URL(import.meta.url).pathname),
    });
  } catch(e: any) {
    return res.status(200).json({ error: e.message, stack: e.stack?.split('\n').slice(0,5) });
  }
}
