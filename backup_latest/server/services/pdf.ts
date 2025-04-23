import PDFDocument from 'pdfkit';

/**
 * Génère un PDF pour une tâche
 * @param tache Les données de la tâche avec tous les détails
 * @returns Buffer contenant le PDF
 */
export async function generatePdf(tache: any): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    try {
      const chunks: Buffer[] = [];
      const doc = new PDFDocument({ 
        margin: 50,
        size: 'A4',
        info: {
          Title: `Tâche - ${tache.titre}`,
          Author: 'TP Suivi',
          Subject: `Détails de la tâche ${tache.id}`,
          Keywords: 'tâche, travaux publics, chantier, suivi'
        }
      });

      // Capture les chunks de données pour créer le buffer final
      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      // Titre du document
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text(`TÂCHE #${tache.id}: ${tache.titre}`, { align: 'center' })
         .moveDown(0.5);
      
      // Chantier et statut
      doc.fontSize(14)
         .font('Helvetica')
         .text(`Chantier: ${tache.chantierNom}`, { align: 'center' })
         .moveDown(0.2);
      
      let statusText = '';
      let statusColor = [0, 0, 0];
      
      switch (tache.statut) {
        case 'a_faire':
          statusText = 'À FAIRE';
          statusColor = [128, 128, 128]; // Gris
          break;
        case 'en_cours':
          statusText = 'EN COURS';
          statusColor = [59, 130, 246]; // Bleu
          break;
        case 'en_validation':
          statusText = 'EN VALIDATION';
          statusColor = [234, 179, 8]; // Jaune
          break;
        case 'termine':
          statusText = 'TERMINÉ';
          statusColor = [5, 150, 105]; // Vert
          break;
        case 'en_retard':
          statusText = 'EN RETARD';
          statusColor = [220, 38, 38]; // Rouge
          break;
        case 'en_revision':
          statusText = 'EN RÉVISION';
          statusColor = [249, 115, 22]; // Orange
          break;
        default:
          statusText = tache.statut.toUpperCase();
      }
      
      // Statut avec couleur
      doc.fillColor(`rgb(${statusColor[0]}, ${statusColor[1]}, ${statusColor[2]})`)
         .fontSize(16)
         .font('Helvetica-Bold')
         .text(statusText, { align: 'center' })
         .moveDown(1);
      
      // Remettre la couleur par défaut
      doc.fillColor('black');
      
      // Ligne horizontale
      doc.moveTo(50, doc.y)
         .lineTo(doc.page.width - 50, doc.y)
         .stroke()
         .moveDown(1);
      
      // Progression
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Progression:', { continued: true })
         .font('Helvetica')
         .text(` ${tache.progression}%`);
      
      // Dessiner une barre de progression
      const progressBarWidth = 400;
      const progressBarHeight = 20;
      const progressX = (doc.page.width - progressBarWidth) / 2;
      const progressY = doc.y + 10;
      
      // Fond de la barre de progression
      doc.rect(progressX, progressY, progressBarWidth, progressBarHeight)
         .fillAndStroke('#e5e7eb', '#d1d5db');
      
      // Partie remplie de la barre de progression
      const fillWidth = (tache.progression / 100) * progressBarWidth;
      
      doc.rect(progressX, progressY, fillWidth, progressBarHeight)
         .fillColor(`rgb(${statusColor[0]}, ${statusColor[1]}, ${statusColor[2]})`)
         .fill();
      
      doc.moveDown(2);
      
      // Description
      doc.fontSize(12)
         .font('Helvetica-Bold')
         .text('Description:')
         .moveDown(0.5);
      
      doc.font('Helvetica')
         .text(tache.description || 'Aucune description fournie.')
         .moveDown(1.5);
      
      // Dates importantes
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Dates importantes', { underline: true })
         .moveDown(0.5);
      
      const dateFormat = (dateString: string | null) => {
        if (!dateString) return 'Non définie';
        return new Date(dateString).toLocaleDateString('fr-FR');
      };
      
      doc.fontSize(12);
      
      if (tache.dateDebut) {
        doc.font('Helvetica-Bold')
           .text('Date de début:', { continued: true })
           .font('Helvetica')
           .text(` ${dateFormat(tache.dateDebut)}`);
      }
      
      if (tache.dateDemande) {
        doc.font('Helvetica-Bold')
           .text('Date de demande:', { continued: true })
           .font('Helvetica')
           .text(` ${dateFormat(tache.dateDemande)}`);
      }
      
      if (tache.dateRealisation) {
        doc.font('Helvetica-Bold')
           .text('Date de réalisation:', { continued: true })
           .font('Helvetica')
           .text(` ${dateFormat(tache.dateRealisation)}`);
      }
      
      if (tache.dateLimite) {
        doc.font('Helvetica-Bold')
           .text('Date limite:', { continued: true });
        
        // Si la date est dépassée, l'afficher en rouge
        const isOverdue = new Date(tache.dateLimite) < new Date();
        
        if (isOverdue) {
          doc.fillColor('red');
        }
        
        doc.font('Helvetica')
           .text(` ${dateFormat(tache.dateLimite)}`);
        
        // Remettre la couleur par défaut
        doc.fillColor('black');
      }
      
      doc.moveDown(1.5);
      
      // Intervenants
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Intervenants', { underline: true })
         .moveDown(0.5);
      
      if (tache.intervenants && tache.intervenants.length > 0) {
        tache.intervenants.forEach((intervenant: any) => {
          doc.fontSize(12)
             .text(`- ${intervenant.prenom} ${intervenant.nom}`);
        });
      } else {
        doc.fontSize(12)
           .font('Helvetica')
           .text('Aucun intervenant assigné.');
      }
      
      doc.moveDown(1.5);
      
      // Documents
      doc.fontSize(14)
         .font('Helvetica-Bold')
         .text('Documents attachés', { underline: true })
         .moveDown(0.5);
      
      if (tache.piecesJointes && tache.piecesJointes.length > 0) {
        tache.piecesJointes.forEach((piece: any, index: number) => {
          doc.fontSize(12)
             .font('Helvetica-Bold')
             .text(`${index + 1}. ${piece.nom}`, { continued: true })
             .font('Helvetica')
             .text(` (${piece.type})`);
          
          if (piece.revisions && piece.revisions.length > 0) {
            doc.text(`   Dernière révision: ${piece.revisions[0].indice} - ${piece.revisions[0].description}`);
          }
          
          doc.moveDown(0.5);
        });
      } else {
        doc.fontSize(12)
           .font('Helvetica')
           .text('Aucun document attaché.');
      }
      
      // Pied de page
      const pageBottom = doc.page.height - 50;
      doc.fontSize(8)
         .text(
           `Document généré le ${new Date().toLocaleString('fr-FR')} par TP Suivi`,
           50,
           pageBottom,
           { align: 'center' }
         );
      
      // Finaliser le document
      doc.end();
      
    } catch (error) {
      reject(error);
    }
  });
}
