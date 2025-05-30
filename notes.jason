// Vercel Serverless Function - Kargo Notları API
// Bu dosyayı /api/notes.js olarak GitHub'a ekleyin

export default async function handler(req, res) {
  // CORS Headers - Tüm origins için
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Max-Age', '86400');
  
  // OPTIONS request (preflight) için
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }
  
  // Basit in-memory storage (Vercel'de dosya yazma sınırlı)
  // Production'da Database kullanmanız önerilir
  
  // Temporary storage - serverless function'lar arasında paylaşılmaz
  // Bu yüzden daha sonra Vercel KV veya başka DB ekleyeceğiz
  
  try {
    if (req.method === 'GET') {
      // Demo notları döndür - daha sonra gerçek storage'la değiştirilecek
      const demoData = {
        notes: {
          "DEMO123": "Bu demo bir nottur",
          "DEMO456": "Vercel çalışıyor!"
        },
        lastUpdate: new Date().toISOString()
      };
      
      res.status(200).json({
        success: true,
        data: demoData,
        timestamp: new Date().toISOString(),
        debug: {
          method: 'GET',
          vercel: true,
          cors_enabled: true
        }
      });
      
    } else if (req.method === 'POST') {
      const { shipment_id, note_text } = req.body;
      
      // Input validation
      if (!shipment_id || typeof shipment_id !== 'string') {
        res.status(400).json({
          success: false,
          error: 'shipment_id gerekli ve string olmalı'
        });
        return;
      }
      
      // Simulate save operation
      res.status(200).json({
        success: true,
        message: 'Not kaydedildi (demo mode)',
        shipment_id: shipment_id,
        note_text: note_text || '',
        timestamp: new Date().toISOString(),
        debug: {
          method: 'POST',
          vercel: true,
          cors_enabled: true,
          received_data: req.body
        }
      });
      
    } else {
      res.status(405).json({
        success: false,
        error: `Method ${req.method} not allowed`,
        allowed_methods: ['GET', 'POST', 'OPTIONS']
      });
    }
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
}
