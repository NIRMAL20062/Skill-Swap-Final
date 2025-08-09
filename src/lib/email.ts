// Email service for sending payment confirmations
import nodemailer from "nodemailer";

export interface PaymentEmailData {
  userEmail: string;
  userName: string;
  paymentId: string;
  orderId: string;
  amount: number;
  coins: number;
  paymentDate: string;
  razorpayPaymentId: string;
}

// Create transporter for Gmail SMTP
const createTransporter = () => {
  if (process.env.SEND_REAL_EMAILS === "true") {
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || "587"),
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }
  return null;
};

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    const shouldSendRealEmail = process.env.SEND_REAL_EMAILS === "true";

    if (shouldSendRealEmail) {
      // Send real email using Nodemailer
      const transporter = createTransporter();
      if (!transporter) {
        throw new Error("Email transporter not configured");
      }

      const htmlContent = generatePaymentConfirmationHTML(data);

      const mailOptions = {
        from: `${process.env.EMAIL_FROM_NAME} <${process.env.EMAIL_FROM_EMAIL}>`,
        to: data.userEmail,
        subject: "Payment Confirmation - SkillSwap Purchase",
        html: htmlContent,
        text: generatePlainTextEmail(data),
      };

      const result = await transporter.sendMail(mailOptions);

      console.log(`✅ Real email sent to ${data.userEmail}`);
      console.log(`📧 Message ID: ${result.messageId}`);

      return {
        success: true,
        message: "Email sent successfully",
        messageId: result.messageId,
      };
    } else {
      // Development mode - log to console
      console.log("📧 Sending payment confirmation email:");
      console.log("=".repeat(50));
      console.log(`To: ${data.userEmail}`);
      console.log(`Subject: Payment Confirmation - SkillSwap Purchase`);
      console.log(`Content:`);
      console.log(generatePlainTextEmail(data));
      console.log("=".repeat(50));

      return { success: true, message: "Email logged (development mode)" };
    }
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

// Generate plain text version of the email
function generatePlainTextEmail(data: PaymentEmailData): string {
  return `Dear ${data.userName},

Your payment has been successfully processed! 🎉

Payment Details:
• Amount: INR ${data.amount}
• Coins Purchased: ${data.coins} SkillCoins
• Payment ID: ${data.paymentId}
• Order ID: ${data.orderId}
• Razorpay Payment ID: ${data.razorpayPaymentId}
• Date: ${data.paymentDate}

Your coins have been added to your wallet and are ready to use!

Thank you for choosing SkillSwap!
Best regards,
The SkillSwap Team`;
}

// Email template for production use
export function generatePaymentConfirmationHTML(
  data: PaymentEmailData
): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation - SkillSwap</title>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #4F46E5; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 8px 8px; }
            .details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #eee; }
            .amount { font-size: 24px; font-weight: bold; color: #10B981; }
            .footer { text-align: center; margin-top: 20px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>🎉 Payment Successful!</h1>
                <p>Thank you for your SkillSwap purchase</p>
            </div>
            
            <div class="content">
                <p>Dear ${data.userName},</p>
                <p>Your payment has been successfully processed and your SkillCoins have been added to your wallet!</p>
                
                <div class="details">
                    <h3>Payment Details</h3>
                    <div class="detail-row">
                        <span>Amount Paid:</span>
                        <span class="amount">INR ${data.amount}</span>
                    </div>
                    <div class="detail-row">
                        <span>SkillCoins Purchased:</span>
                        <span><strong>${data.coins} coins</strong></span>
                    </div>
                    <div class="detail-row">
                        <span>Payment ID:</span>
                        <span>${data.paymentId}</span>
                    </div>
                    <div class="detail-row">
                        <span>Order ID:</span>
                        <span>${data.orderId}</span>
                    </div>
                    <div class="detail-row">
                        <span>Razorpay Payment ID:</span>
                        <span>${data.razorpayPaymentId}</span>
                    </div>
                    <div class="detail-row">
                        <span>Date:</span>
                        <span>${data.paymentDate}</span>
                    </div>
                </div>
                
                <p>Your coins are now available in your wallet and ready to use for booking skill-sharing sessions!</p>
                
                <div class="footer">
                    <p>Thank you for choosing SkillSwap!</p>
                    <p><strong>The SkillSwap Team</strong></p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
}
