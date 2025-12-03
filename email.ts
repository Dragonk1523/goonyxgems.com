import { MailService } from '@sendgrid/mail';

if (process.env.SENDGRID_API_KEY) {
  const mailService = new MailService();
  mailService.setApiKey(process.env.SENDGRID_API_KEY);
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log('SendGrid API key not configured. Email would be sent:', {
        to: params.to,
        from: params.from,
        subject: params.subject,
        text: params.text
      });
      return true; // Return success for development
    }

    const mailService = new MailService();
    mailService.setApiKey(process.env.SENDGRID_API_KEY);

    await mailService.send({
      to: params.to,
      from: params.from,
      subject: params.subject,
      text: params.text || '',
      html: params.html || '',
    });
    
    console.log('Email sent successfully to:', params.to);
    return true;
  } catch (error) {
    console.error('Email sending error:', error);
    return false;
  }
}

export function generateContactEmailHtml(inquiry: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .header { background-color: #f59e0b; color: black; padding: 20px; text-align: center; }
        .content { padding: 20px; background-color: #f9f9f9; }
        .footer { background-color: #1f2937; color: #f59e0b; padding: 15px; text-align: center; }
        .field { margin-bottom: 15px; }
        .label { font-weight: bold; color: #f59e0b; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>New Solar Quote Request - Onyx Energy Solutions</h1>
      </div>
      
      <div class="content">
        <h2>Contact Information</h2>
        <div class="field">
          <span class="label">Name:</span> ${inquiry.firstName} ${inquiry.lastName}
        </div>
        <div class="field">
          <span class="label">Email:</span> ${inquiry.email}
        </div>
        <div class="field">
          <span class="label">Phone:</span> ${inquiry.phone}
        </div>
        <div class="field">
          <span class="label">Address:</span> ${inquiry.address}
        </div>
        <div class="field">
          <span class="label">Monthly Electric Bill:</span> $${inquiry.monthlyBill}
        </div>
        
        <h2>Message</h2>
        <div class="field">
          ${inquiry.message || 'No additional message provided.'}
        </div>
        
        <h2>Estimated Savings</h2>
        <div class="field">
          Based on their monthly bill of $${inquiry.monthlyBill}:
          <ul>
            <li>Annual Savings: $${Math.round(parseFloat(inquiry.monthlyBill) * 12 * 0.9)}</li>
            <li>20-Year Savings: $${Math.round(parseFloat(inquiry.monthlyBill) * 12 * 0.9 * 20)}</li>
          </ul>
        </div>
      </div>
      
      <div class="footer">
        <p><strong>Onyx Energy Solutions</strong></p>
        <p>Gold Standards Keeping You in the Black</p>
        <p>Call them at: <strong>(401) 216-8890</strong></p>
      </div>
    </body>
    </html>
  `;
}

export function generateContactEmailText(inquiry: any): string {
  return `
New Solar Quote Request - Onyx Energy Solutions

Contact Information:
Name: ${inquiry.firstName} ${inquiry.lastName}
Email: ${inquiry.email}
Phone: ${inquiry.phone}
Address: ${inquiry.address}
Monthly Electric Bill: $${inquiry.monthlyBill}

Message:
${inquiry.message || 'No additional message provided.'}

Estimated Savings:
Based on their monthly bill of $${inquiry.monthlyBill}:
- Annual Savings: $${Math.round(parseFloat(inquiry.monthlyBill) * 12 * 0.9)}
- 20-Year Savings: $${Math.round(parseFloat(inquiry.monthlyBill) * 12 * 0.9 * 20)}

---
Onyx Energy Solutions
Gold Standards Keeping You in the Black
Call them at: (401) 216-8890
  `;
}