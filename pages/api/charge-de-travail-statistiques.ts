import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/charge-de-travail-statistiques - Headers:`, req.headers);
  
  if (req.method === 'OPTIONS') {
    console.log('[API] Handling OPTIONS request');
    return res.status(200).end();
  }

  try {
    console.log('[API] Processing request');
    const mockData = {
      totalWorkload: 24,
      averageWorkload: 6,
      distribution: [
        { range: '0-4h', count: 2 },
        { range: '4-8h', count: 3 },
        { range: '8h+', count: 1 }
      ]
    };

    console.log('[API] Sending response');
    res.status(200).json({
      success: true,
      data: mockData,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('[API] Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal Server Error',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    });
  }
}
