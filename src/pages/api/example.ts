// Trigger Vercel redeploy: minor change
import { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'GET') {
    return res.status(200).json({ message: 'API is working' });
  }

  return res.status(405).json({ message: 'Method not allowed' });
} 