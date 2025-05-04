import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(`[API] ${req.method} /api/taches - Headers:`, req.headers);
  
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log('[API] Handling OPTIONS request');
    return res.status(200).end();
  }

  try {
    console.log('[API] Processing request');
    // Mock data
    const mockData = [
      { id: 1, title: 'Tâche 1', status: 'pending' },
      { id: 2, title: 'Tâche 2', status: 'completed' }
    ];

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
