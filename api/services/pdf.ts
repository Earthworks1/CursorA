// Simple mock implementation of PDF generation
export async function generatePdf(
  templateName: string,
  data: any,
  options: any = {}
): Promise<Buffer> {
  console.log(`[MOCK] Would generate PDF using template: ${templateName}`);
  console.log(`[MOCK] PDF data: ${JSON.stringify(data)}`);
  console.log(`[MOCK] Options: ${JSON.stringify(options)}`);
  
  // Return a mock PDF buffer
  return Buffer.from('Mock PDF content');
}
