import { VercelRequest, VercelResponse } from '@vercel/node';

export default function handler(req: VercelRequest, res: VercelResponse) {
  switch (req.method) {
    case 'GET':
      res.status(200).json([]);
      break;
    case 'POST':
    case 'PATCH':
    case 'PUT':
      res.status(200).json({ success: true });
      break;
    case 'DELETE':
      res.status(200).json({ success: true });
      break;
    default:
      res.status(405).json({ message: 'Méthode non autorisée' });
  }
} 