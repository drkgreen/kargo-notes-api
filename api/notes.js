// Vercel Serverless Function - Upstash Redis ile Kargo Notları API
// GitHub: /api/notes.js dosyasını tamamen bu kodla değiştirin

export default async function handler(req, res) {
  // CORS Headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // OPTIONS preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Upstash Redis REST API
  const REDIS_URL = process.env.KV_REST_API_URL;
  const REDIS_TOKEN = process.env.KV_REST_API_TOKEN;
  
  if (!REDIS_URL || !REDIS_TOKEN) {
    return res.status(500).json({
      success: false,
      error: 'Redis not configured',
      debug: {
        hasUrl: !!REDIS_URL,
        hasToken: !!REDIS_TOKEN,
        env: process.env.NODE_ENV
      }
    });
  }
  
  // Redis komut çalıştırıcı
  async function redis(command, ...args) {
    const body = args.length > 0 ? [command, ...args] : [command];
    
    try {
      const response = await fetch(`${REDIS_URL}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${REDIS_TOKEN}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });
      
      if (!response.ok) {
        throw new Error(`Redis HTTP ${response.status}`);
      }
      
      const data = await response.json();
      return data.result;
    } catch (error) {
      console.error('Redis error:', error);
      throw error;
    }
  }
  
  try {
    if (req.method === 'GET') {
      // Tüm notları Redis'ten getir
      const notes = await redis('HGETALL', 'kargo_notes');
      const lastUpdate = await redis('GET', 'last_update') || new Date().toISOString();
      
      res.status(200).json({
        success: true,
        data: {
          notes: notes || {},
          lastUpdate: lastUpdate
        },
        timestamp: new Date().toISOString(),
        debug: {
          method: 'GET',
          redis_connected: true,
          cors_enabled: true,
          note_count: Object.keys(notes || {}).length
        }
      });
      
    } else if (req.method === 'POST') {
      const { shipment_id, note_text } = req.body;
      
      if (!shipment_id || typeof shipment_id !== 'string') {
        return res.status(400).json({
          success: false,
          error: 'shipment_id gerekli (string)'
        });
      }
      
      const cleanId = shipment_id.trim();
      const cleanText = (note_text || '').trim();
      
      if (cleanText) {
        // Not kaydet
        await redis('HSET', 'kargo_notes', cleanId, cleanText);
        await redis('SET', 'last_update', new Date().toISOString());
        
        res.status(200).json({
          success: true,
          message: 'Not Redis\'e kaydedildi',
          shipment_id: cleanId,
          note_text: cleanText,
          timestamp: new Date().toISOString(),
          debug: {
            method: 'POST',
            action: 'save',
            redis_connected: true
          }
        });
        
      } else {
        // Boş not - sil
        await redis('HDEL', 'kargo_notes', cleanId);
        await redis('SET', 'last_update', new Date().toISOString());
        
        res.status(200).json({
          success: true,
          message: 'Not Redis\'ten silindi',
          shipment_id: cleanId,
          note_text: '',
          timestamp: new Date().toISOString(),
          debug: {
            method: 'POST',
            action: 'delete',
            redis_connected: true
          }
        });
      }
      
    } else {
      res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Redis database error',
      message: error.message,
      timestamp: new Date().toISOString(),
      debug: {
        redis_url: REDIS_URL ? 'configured' : 'missing',
        redis_token: REDIS_TOKEN ? 'configured' : 'missing',
        error_type: error.name
      }
    });
  }
}
