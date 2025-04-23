import nodemailer from 'nodemailer';

// Configuration du service de mail (pour un environnement de prod, utiliser un vrai service SMTP)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.example.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || 'user@example.com',
    pass: process.env.SMTP_PASSWORD || 'password'
  },
  // En mode développement, ignorer les problèmes de certificat
  ...(process.env.NODE_ENV === 'development' && {
    tls: { rejectUnauthorized: false }
  })
});

// En développement, ne pas envoyer d'emails réels
const isDevelopment = process.env.NODE_ENV === 'development';

/**
 * Envoie un email de notification à un utilisateur
 * @param to Email du destinataire
 * @param subject Sujet de l'email
 * @param text Contenu en texte brut
 * @param html Contenu HTML (optionnel)
 */
export async function sendNotificationEmail(
  to: string,
  subject: string,
  text: string,
  html?: string
): Promise<boolean> {
  // En développement, juste logger l'email
  if (isDevelopment) {
    console.log('====== EMAIL NOTIFICATION ======');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text}`);
    console.log('===============================');
    return true;
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM || '"TP Suivi" <notifier@tpsuivi.fr>',
      to,
      subject,
      text,
      html: html || `<p>${text}</p>`
    });

    console.log(`Email envoyé: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error('Erreur lors de l\'envoi de l\'email:', error);
    return false;
  }
}

/**
 * Envoie une notification de rappel pour les tâches en retard
 * @param to Email du destinataire
 * @param tasks Liste des tâches en retard
 */
export async function sendTasksReminderEmail(
  to: string,
  tasks: { id: number, titre: string, dateLimite: string, chantierNom: string }[]
): Promise<boolean> {
  if (tasks.length === 0) return true;

  const subject = `Rappel: ${tasks.length} tâche(s) en retard ou proches de l'échéance`;

  const text = `
    Vous avez ${tasks.length} tâche(s) qui nécessitent votre attention:
    
    ${tasks.map(task => `- ${task.titre} (${task.chantierNom}) - Échéance: ${new Date(task.dateLimite).toLocaleDateString('fr-FR')}`).join('\n')}
    
    Veuillez vous connecter à l'application TP Suivi pour plus de détails.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1E40AF;">Rappel: Tâches à traiter</h2>
      <p>Vous avez <strong>${tasks.length} tâche(s)</strong> qui nécessitent votre attention:</p>
      
      <ul style="padding-left: 20px;">
        ${tasks.map(task => `
          <li style="margin-bottom: 10px;">
            <strong>${task.titre}</strong> (${task.chantierNom})
            <br>
            <span style="color: ${new Date(task.dateLimite) < new Date() ? '#DC2626' : '#F97316'};">
              Échéance: ${new Date(task.dateLimite).toLocaleDateString('fr-FR')}
            </span>
          </li>
        `).join('')}
      </ul>
      
      <p style="margin-top: 20px;">
        <a href="#" style="background-color: #1E40AF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
          Voir les détails dans l'application
        </a>
      </p>
      
      <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
        Ce message est envoyé automatiquement par TP Suivi. Merci de ne pas y répondre.
      </p>
    </div>
  `;

  return sendNotificationEmail(to, subject, text, html);
}

/**
 * Envoie une notification pour une nouvelle révision de document
 * @param to Email du destinataire
 * @param document Informations sur le document
 * @param revision Informations sur la révision
 * @param task Informations sur la tâche
 */
export async function sendRevisionNotificationEmail(
  to: string,
  document: { id: number, nom: string },
  revision: { indice: string, description: string, user: { prenom: string, nom: string } },
  task: { id: number, titre: string, chantierNom: string }
): Promise<boolean> {
  const subject = `Nouvelle révision: ${document.nom} - Indice ${revision.indice}`;

  const text = `
    Une nouvelle révision a été créée pour le document "${document.nom}" de la tâche "${task.titre}" (${task.chantierNom}).
    
    Indice: ${revision.indice}
    Description: ${revision.description}
    Par: ${revision.user.prenom} ${revision.user.nom}
    
    Veuillez vous connecter à l'application TP Suivi pour consulter cette révision.
  `;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #1E40AF;">Nouvelle révision de document</h2>
      
      <p>Une nouvelle révision a été créée pour le document:</p>
      
      <div style="background-color: #F9FAFB; padding: 15px; border-left: 4px solid #3B82F6; margin: 15px 0;">
        <p style="margin: 0;"><strong>${document.nom}</strong></p>
        <p style="margin: 5px 0 0;">de la tâche "${task.titre}" (${task.chantierNom})</p>
      </div>
      
      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB; width: 30%;"><strong>Indice:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${revision.indice}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Description:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${revision.description}</td>
        </tr>
        <tr>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;"><strong>Par:</strong></td>
          <td style="padding: 8px; border-bottom: 1px solid #E5E7EB;">${revision.user.prenom} ${revision.user.nom}</td>
        </tr>
      </table>
      
      <p style="margin-top: 20px;">
        <a href="#" style="background-color: #1E40AF; color: white; padding: 10px 15px; text-decoration: none; border-radius: 4px;">
          Consulter dans l'application
        </a>
      </p>
      
      <p style="color: #6B7280; font-size: 12px; margin-top: 30px;">
        Ce message est envoyé automatiquement par TP Suivi. Merci de ne pas y répondre.
      </p>
    </div>
  `;

  return sendNotificationEmail(to, subject, text, html);
}
