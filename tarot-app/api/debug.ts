export default async function handler(req: any, res: any) {
  try {
    // Try importing the actual index module
    const mod = await import('./index');
    return res.status(200).json({ success: true, hasDefault: typeof mod.default === 'function' });
  } catch(e: any) {
    return res.status(200).json({ 
      error: e.message, 
      stack: e.stack?.split('\n').slice(0,10),
      name: e.name,
      code: e.code
    });
  }
}
