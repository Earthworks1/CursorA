import { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Récupérer le chemin complet de la requête
  const fullPath = decodeURIComponent(req.url || '');
  console.log('Full path:', fullPath);

  try {
    // Route pour les statistiques
    if (fullPath.includes('/statistiques') || fullPath.includes('/stats')) {
      const stats = await getWorkloadStats();
      return res.status(200).json(stats);
    }
    
    // Route pour les activités
    if (fullPath.includes('/activites') || fullPath.includes('/activités') || fullPath.includes('/activities')) {
      const activities = await getRecentActivities();
      return res.status(200).json(activities);
    }

    // Route pour les utilisateurs
    if (fullPath.includes('/utilisateurs')) {
      return res.status(200).json([]); // Pour l'instant retourne une liste vide
    }

    // Route pour les sites
    if (fullPath.includes('/sites')) {
      return res.status(200).json([]); // Pour l'instant retourne une liste vide
    }

    // Route pour les tâches (français ou anglais)
    if (fullPath.includes('/taches') || fullPath.includes('/tâches') || fullPath.includes('/tasks')) {
      const tasks = await getRecentTasks();
      return res.status(200).json(tasks);
    }

    return res.status(404).json({ 
      message: 'Route not found',
      path: fullPath
    });
  } catch (error) {
    console.error('Workload API Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

async function getWorkloadStats() {
  const now = new Date();
  const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
  const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [
    chantiersActifs,
    tachesEnCours,
    tachesEnRetard,
    revisionsPlans,
    chantiersLastMonth,
    tachesLastWeek,
    retardsLastWeek,
    revisionsLastMonth
  ] = await Promise.all([
    prisma.chantier.count({ where: { status: 'ACTIF' } }),
    prisma.tache.count({ where: { status: 'EN_COURS' } }),
    prisma.tache.count({ 
      where: { 
        deadline: { lt: now },
        status: { notIn: ['TERMINE', 'ANNULE'] }
      }
    }),
    prisma.revision.count({
      where: { createdAt: { gte: lastMonth } }
    }),
    prisma.chantier.count({ 
      where: { 
        status: 'ACTIF',
        createdAt: { gte: lastMonth }
      }
    }),
    prisma.tache.count({
      where: {
        createdAt: { gte: lastWeek },
        status: 'EN_COURS'
      }
    }),
    prisma.tache.count({
      where: {
        deadline: { lt: lastWeek },
        status: { notIn: ['TERMINE', 'ANNULE'] }
      }
    }),
    prisma.revision.count({
      where: { 
        createdAt: { 
          gte: new Date(lastMonth.getFullYear(), lastMonth.getMonth() - 1, lastMonth.getDate())
        }
      }
    })
  ]);

  // Calculer les évolutions
  const chantiersEvolution = chantiersLastMonth === 0 ? 0 : 
    Math.round(((chantiersActifs - chantiersLastMonth) / chantiersLastMonth) * 100);
  
  const tachesEvolution = tachesLastWeek === 0 ? 0 :
    Math.round(((tachesEnCours - tachesLastWeek) / tachesLastWeek) * 100);
  
  const retardsEvolution = retardsLastWeek === 0 ? 0 :
    Math.round(((tachesEnRetard - retardsLastWeek) / retardsLastWeek) * 100);
  
  const revisionsEvolution = revisionsLastMonth === 0 ? 0 :
    Math.round(((revisionsPlans - revisionsLastMonth) / revisionsLastMonth) * 100);

  return {
    chantiersActifs,
    tachesEnCours,
    tachesEnRetard,
    revisionsPlans,
    chantiersEvolution,
    tachesEvolution,
    retardsEvolution,
    revisionsEvolution
  };
}

async function getRecentActivities() {
  const activities = await prisma.activite.findMany({
    take: 10,
    orderBy: { timestamp: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          image: true
        }
      },
      project: {
        select: {
          name: true
        }
      }
    }
  });

  return activities.map(activity => ({
    id: activity.id,
    type: activity.type,
    description: activity.description,
    timestamp: activity.timestamp,
    user: {
      name: activity.user.name,
      avatar: activity.user.image
    },
    project: {
      name: activity.project.name
    }
  }));
}

async function getRecentTasks() {
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

  return tasks.map(task => ({
    id: task.id,
    title: task.title,
    projectName: task.project.name,
    status: task.status,
    dueDate: task.deadline.toISOString(),
    progress: task.progress || 0
  }));
} 