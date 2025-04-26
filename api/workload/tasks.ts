import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const tasks = await prisma.tache.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        project: {
          select: {
            name: true
          }
        }
      }
    });

    return res.status(200).json(tasks.map(task => ({
      id: task.id,
      title: task.title,
      projectName: task.project.name,
      status: task.status,
      dueDate: task.deadline.toISOString(),
      progress: task.progress || 0
    })));
  } catch (error) {
    console.error('Workload API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 