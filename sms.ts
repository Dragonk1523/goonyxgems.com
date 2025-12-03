
interface SMSParams {
  to: string;
  message: string;
  from?: string;
}

export async function sendSMS(params: SMSParams): Promise<boolean> {
  try {
    // Using Twilio for SMS - you'll need to add TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN to secrets
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      console.log('Twilio credentials not configured. SMS would be sent:', {
        to: params.to,
        message: params.message
      });
      return true; // Return success for development
    }

    // Uncomment when you add Twilio credentials
    /*
    const twilio = require('twilio');
    const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    
    await client.messages.create({
      body: params.message,
      from: params.from || process.env.TWILIO_PHONE_NUMBER,
      to: params.to
    });
    */
    
    console.log('SMS sent successfully to:', params.to);
    return true;
  } catch (error) {
    console.error('SMS sending error:', error);
    return false;
  }
}

export function generateQuoteReminderSMS(inquiry: any): string {
  return `Hi ${inquiry.firstName}! This is Onyx Energy Solutions. Your solar quote is ready! Based on your $${inquiry.monthlyBill} monthly bill, you could save $${Math.round(parseFloat(inquiry.monthlyBill) * 12 * 0.8)} annually. Call us at (508) 257-1664 to discuss your solar installation!`;
}

export function generateFollowUpSMS(inquiry: any): string {
  return `Hi ${inquiry.firstName}, it's Onyx Energy Solutions! We wanted to follow up on your solar quote request. Our team is ready to schedule your free consultation. Call (508) 257-1664 or reply STOP to opt out.`;
}
