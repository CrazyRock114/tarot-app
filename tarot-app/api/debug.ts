export default async function handler(req: any, res: any) {
  try {
    // Test basic imports one by one
    const results: string[] = [];
    
    try { await import('mongoose'); results.push('mongoose: OK'); } catch(e: any) { results.push('mongoose: FAIL - ' + e.message); }
    try { await import('dotenv'); results.push('dotenv: OK'); } catch(e: any) { results.push('dotenv: FAIL - ' + e.message); }
    try { await import('jsonwebtoken'); results.push('jwt: OK'); } catch(e: any) { results.push('jwt: FAIL - ' + e.message); }
    try { await import('bcryptjs'); results.push('bcrypt: OK'); } catch(e: any) { results.push('bcrypt: FAIL - ' + e.message); }
    try { await import('msedge-tts'); results.push('msedge-tts: OK'); } catch(e: any) { results.push('msedge-tts: FAIL - ' + e.message); }
    
    return res.status(200).json({ 
      node: process.version,
      env_keys: Object.keys(process.env).filter(k => k.includes('MONGO') || k.includes('DEEP') || k.includes('JWT')),
      imports: results
    });
  } catch(e: any) {
    return res.status(500).json({ error: e.message, stack: e.stack?.split('\n').slice(0,5) });
  }
}
