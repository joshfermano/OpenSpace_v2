import nodemailer from 'nodemailer';
import 'dotenv/config';

const VERIFIED_SENDER = process.env.EMAIL_FROM || 'openspacereserve@gmail.com';

const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

// Create reusable transporter
const createTransporter = () => {
  const isDevelopment = process.env.NODE_ENV !== 'production';

  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.sendgrid.net',
    port: Number(process.env.EMAIL_PORT) || 587,
    secure: false, // false for TLS - port 587
    auth: {
      user: process.env.EMAIL_USER || 'apikey',
      pass: process.env.EMAIL_PASSWORD,
    },
    tls: {
      rejectUnauthorized: !isDevelopment,
    },
  });
};

const transporter = createTransporter();

transporter.verify((error) => {
  if (error) {
    console.error('SMTP connection error:', error);
  } else {
    console.log('✅ Email server ready to send messages');
  }
});

export const sendTestEmail = async (
  to: string
): Promise<nodemailer.SentMessageInfo> => {
  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject: 'OpenSpace Email Test',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2>Email Delivery Test</h2>
        <p>This is a test email from OpenSpace to confirm that email delivery is working properly.</p>
        <p>If you're receiving this, your email configuration is correct!</p>
        <p>Time sent: ${new Date().toLocaleString()}</p>
      </div>
    `,
  };

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Test email sent to ${to} successfully`);
    console.log('Message ID:', result.messageId);
    return result;
  } catch (error) {
    console.error('Error sending test email:', error);
    throw new Error('Failed to send test email');
  }
};

// Send OTP verification email
export const sendOtpVerificationEmail = async (
  to: string,
  firstName: string,
  otp: string
): Promise<void> => {
  console.log(`Attempting to send OTP verification to: ${to}`);
  const isDevelopment = process.env.NODE_ENV !== 'production';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h2 style="color: #333;">OpenSpace</h2>
      </div>
      
      <h2 style="color: #333; text-align: center;">Verify Your Email Address</h2>
      
      <p>Hello ${firstName},</p>
      
      <p>Thank you for signing up with OpenSpace. To complete your registration, please use the following verification code:</p>
      
      <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; text-align: center; margin: 20px 0; font-size: 24px; letter-spacing: 5px; font-weight: bold;">
        ${otp}
      </div>
      
      <p>This code will expire in 15 minutes for security purposes.</p>
      
      <p>If you didn't request this code, you can safely ignore this email.</p>
      
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e0e0e0; text-align: center; color: #777; font-size: 12px;">
        <p>© ${new Date().getFullYear()} OpenSpace. All rights reserved.</p>
      </div>
    </div>
  `;

  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject: 'Verify Your Email Address - OpenSpace',
    html,
  };

  // Always log the OTP in development environment for debugging
  if (isDevelopment) {
    console.log('\n-------- OTP VERIFICATION EMAIL --------');
    console.log(`To: ${to}`);
    console.log(`Subject: Verify Your Email Address - OpenSpace`);
    console.log(`OTP: ${otp}`);
    console.log('-----------------------------------\n');

    // If no SMTP credentials, just log and return in development
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(
        'No SMTP credentials provided. Skipping actual email sending in development mode.'
      );
      return;
    }
  }

  try {
    console.log('SMTP Configuration:', {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: Number(process.env.EMAIL_PORT) || 465,
      auth: {
        user: process.env.EMAIL_USER
          ? `${process.env.EMAIL_USER.substring(0, 3)}...`
          : 'not set',
        pass: process.env.EMAIL_PASSWORD ? 'is set (hidden)' : 'not set',
      },
    });

    const result = await transporter.sendMail(mailOptions);
    console.log(`Verification OTP email sent to ${to} successfully`);
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Error sending OTP verification email:', error);

    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }

    if (isDevelopment) {
      console.log('\nTROUBLESHOOTING TIPS:');
      console.log('1. Check your Mailtrap credentials in .env file');
      console.log(
        '2. Ensure your firewall is not blocking outgoing SMTP connections'
      );
      console.log('3. Verify that your Mailtrap account is active');
      console.log(
        '4. Try using a different SMTP service like SendGrid, Gmail, etc.'
      );
    }

    throw new Error('Failed to send verification OTP');
  }
};

// Send verification email (link version)
export const sendVerificationEmail = async (
  to: string,
  firstName: string,
  token: string
): Promise<void> => {
  console.log(
    `Attempting to send verification email to: ${to} with token: ${token.substring(
      0,
      5
    )}...`
  );

  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verificationUrl = `${baseUrl}/verify-email/${token}`;

  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject: 'Verify Your Email Address',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Welcome to OpenSpace!</h2>
        <p>Hello ${firstName},</p>
        <p>Thank you for registering. Please verify your email address by clicking the button below:</p>
        <a href="${verificationUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Verify Email Address</a>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${verificationUrl}</p>
        <p>This link will expire in 24 hours.</p>
        <p>Best regards,<br>The OpenSpace Team</p>
      </div>
    `,
  };

  // Log the verification URL for testing purposes in development
  if (process.env.NODE_ENV === 'development') {
    console.log('\n-------- VERIFICATION EMAIL (DEV MODE) --------');
    console.log(`To: ${to}`);
    console.log(`Verification URL: ${verificationUrl}`);
    console.log('-----------------------------------\n');
  }

  try {
    const result = await transporter.sendMail(mailOptions);
    console.log(`Verification email sent to ${to} successfully`);
    console.log('Email message ID:', result.messageId);
  } catch (error) {
    console.error('Error sending verification email:', error);
    // Log detailed error for debugging
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
  }
};

// Send password reset email
export const sendPasswordResetEmail = async (
  to: string,
  token: string
): Promise<void> => {
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetUrl = `${baseUrl}/reset-password/${token}`;

  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject: 'Reset Your Password',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Password Reset Request</h2>
        <p>You requested a password reset. Please click the button below to reset your password:</p>
        <a href="${resetUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Reset Password</a>
        <p>If the button doesn't work, you can also copy and paste the following link into your browser:</p>
        <p>${resetUrl}</p>
        <p>This link will expire in 1 hour.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <p>Best regards,<br>The OpenSpace Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

// Send booking confirmation to user
export const sendBookingConfirmationEmail = async (
  to: string,
  bookingDetails: {
    bookingId: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    totalPrice: number;
    guestCount: number;
    paymentMethod?: string;
    paymentStatus?: string;
    receiptUrl?: string;
  }
): Promise<void> => {
  const {
    bookingId,
    roomName,
    checkIn,
    checkOut,
    totalPrice,
    guestCount,
    paymentMethod,
    paymentStatus,
    receiptUrl,
  } = bookingDetails;
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

  // Payment information section
  let paymentInfo = '';
  if (paymentMethod === 'creditCard') {
    paymentInfo = `
      <div style="margin-top: 15px; margin-bottom: 15px; padding: 10px; background-color: #f0f8ff; border-radius: 5px;">
        <h3 style="margin-top: 0;">Payment Information</h3>
        <p><strong>Payment Method:</strong> Credit Card</p>
        <p><strong>Payment Status:</strong> ${paymentStatus || 'Paid'}</p>
        ${
          receiptUrl
            ? `<p><a href="${receiptUrl}" target="_blank" style="color: #4CAF50;">View Receipt</a></p>`
            : ''
        }
      </div>
    `;
  } else if (paymentMethod === 'property') {
    paymentInfo = `
      <div style="margin-top: 15px; margin-bottom: 15px; padding: 10px; background-color: #fff8e1; border-radius: 5px;">
        <h3 style="margin-top: 0;">Payment Information</h3>
        <p><strong>Payment Method:</strong> Pay at Property</p>
        <p><strong>Payment Status:</strong> Payment Due on Arrival</p>
        <p>Please prepare the exact amount of ${formatCurrency(
          totalPrice
        )} for your stay.</p>
      </div>
    `;
  }

  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject: 'Your OpenSpace Booking Confirmation',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmation</h2>
        <p>Thank you for booking with OpenSpace! Your reservation details are below:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${roomName}</h3>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Guests:</strong> ${guestCount}</p>
          <p><strong>Total Price:</strong> ${formatCurrency(totalPrice)}</p>
          <p><strong>Booking Status:</strong> Pending Host Confirmation</p>
        </div>
        
        ${paymentInfo}
        
        <p>Please note that your booking is currently <strong>pending</strong> and requires host confirmation. You'll receive another email once the host confirms your reservation.</p>
        
        <p>You can view your booking details and manage your reservation by clicking the button below:</p>
        <a href="${bookingUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">View Booking</a>
        
        <p>Important information:</p>
        <ul>
          <li>You can cancel this booking free of charge up to 24 hours before your check-in date.</li>
          <li>Please contact your host directly for any special requests or questions about the property.</li>
          <li>Be sure to review the house rules before your arrival.</li>
        </ul>
        
        <p>Thank you for choosing OpenSpace for your accommodation needs!</p>
        <p>Best regards,<br>The OpenSpace Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending booking confirmation email:', error);
    // Log error but don't throw, to ensure booking process completes even if email fails
  }
};

// Send booking status update emails to users
export const sendBookingStatusUpdateEmail = async (
  to: string,
  status: 'confirmed' | 'rejected',
  bookingDetails: {
    bookingId: string;
    roomName: string;
    checkIn: string;
    checkOut: string;
    rejectionReason?: string;
    totalPrice?: number;
    paymentMethod?: string;
  }
): Promise<void> => {
  const {
    bookingId,
    roomName,
    checkIn,
    checkOut,
    rejectionReason,
    totalPrice,
    paymentMethod,
  } = bookingDetails;
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

  const subject =
    status === 'confirmed'
      ? '✅ Your OpenSpace Booking is Confirmed!'
      : '❌ Your OpenSpace Booking Request has been Declined';

  let htmlContent = '';

  if (status === 'confirmed') {
    // Payment reminder for pay at property bookings
    const paymentReminder =
      paymentMethod === 'property' && totalPrice
        ? `
          <div style="background-color: #fff8e1; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Payment Reminder</h3>
            <p>You have selected to pay at the property. Please prepare ${formatCurrency(
              totalPrice
            )} for payment upon arrival.</p>
          </div>
        `
        : '';

    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Confirmed</h2>
        <p>Good news! Your host has confirmed your reservation.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${roomName}</h3>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Booking Status:</strong> Confirmed</p>
        </div>
        
        ${paymentReminder}
        
        <p>You're all set for your upcoming stay! Remember these important details:</p>
        <ul>
          <li>Check-in time and instructions will be available in your booking details</li>
          <li>You can cancel this booking free of charge up to 24 hours before your check-in date</li>
          <li>Your host is expecting you and is looking forward to your stay</li>
        </ul>
        
        <p>You can view your booking details by clicking the button below:</p>
        <a href="${bookingUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">View Booking</a>
        
        <p>Thank you for choosing OpenSpace! We wish you a pleasant stay.</p>
        <p>Best regards,<br>The OpenSpace Team</p>
      </div>
    `;
  } else {
    htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Booking Request Declined</h2>
        <p>We're sorry to inform you that your booking request has been declined by the host.</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${roomName}</h3>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Booking Status:</strong> Declined</p>
          ${
            rejectionReason
              ? `<p><strong>Reason:</strong> ${rejectionReason}</p>`
              : ''
          }
        </div>
        
        <p>The host has provided the reason above for declining your booking request. This may be due to availability issues, maintenance, or other factors.</p>
        
        <p>Don't worry - OpenSpace has many other great properties available. We encourage you to browse other listings that might meet your needs:</p>
        <a href="${baseUrl}/rooms" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Browse Rooms</a>
        
        <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The OpenSpace Team</p>
      </div>
    `;
  }

  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject,
    html: htmlContent,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error(`Error sending booking ${status} email:`, error);
  }
};

// Host notification about new booking
export const sendHostBookingNotificationEmail = async (
  to: string,
  bookingDetails: {
    bookingId: string;
    roomName: string;
    guestName: string;
    checkIn: string;
    checkOut: string;
    guestCount: number;
    totalPrice: number;
    paymentMethod?: string;
  }
): Promise<void> => {
  const {
    bookingId,
    roomName,
    guestName,
    checkIn,
    checkOut,
    guestCount,
    totalPrice,
    paymentMethod,
  } = bookingDetails;
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const bookingUrl = `${baseUrl}/host/bookings/${bookingId}`;

  // Include payment method info if available
  const paymentInfo = paymentMethod
    ? `<p><strong>Payment Method:</strong> ${
        paymentMethod === 'creditCard'
          ? 'Credit Card (Pre-paid)'
          : 'Pay at Property'
      }</p>`
    : '';

  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject: '🔔 New Booking Request for Your Property',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>New Booking Request</h2>
        <p>You have received a new booking request for your property:</p>
        
        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>${roomName}</h3>
          <p><strong>Guest:</strong> ${guestName}</p>
          <p><strong>Check-in:</strong> ${checkIn}</p>
          <p><strong>Check-out:</strong> ${checkOut}</p>
          <p><strong>Guests:</strong> ${guestCount}</p>
          <p><strong>Total Price:</strong> ${formatCurrency(totalPrice)}</p>
          ${paymentInfo}
        </div>
        
        <p>Please review and respond to this booking request as soon as possible. You can accept or decline this request through your host dashboard.</p>
        
        <a href="${bookingUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">Respond to Request</a>
        
        <p>Remember, responding promptly to booking requests helps maintain a high response rate and attracts more guests to your property.</p>
        <p>Best regards,<br>The OpenSpace Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending host booking notification email:', error);
  }
};

// Send payment confirmation email
export const sendPaymentConfirmationEmail = async (
  to: string,
  paymentDetails: {
    bookingId: string;
    roomName: string;
    amount: number;
    paymentDate: string;
    paymentMethod: string;
    receiptUrl?: string;
  }
): Promise<void> => {
  const {
    bookingId,
    roomName,
    amount,
    paymentDate,
    paymentMethod,
    receiptUrl,
  } = paymentDetails;
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject: '💳 Payment Confirmation for Your OpenSpace Booking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payment Confirmation</h2>
        <p>Thank you for your payment! We've successfully processed your payment for your booking at <strong>${roomName}</strong>.</p>
        
        <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Payment Details</h3>
          <p><strong>Amount:</strong> ${formatCurrency(amount)}</p>
          <p><strong>Date:</strong> ${paymentDate}</p>
          <p><strong>Payment Method:</strong> ${
            paymentMethod === 'creditCard' ? 'Credit Card' : 'Cash at Property'
          }</p>
          ${
            receiptUrl
              ? `<p><a href="${receiptUrl}" target="_blank" style="color: #4CAF50;">View Receipt</a></p>`
              : ''
          }
        </div>
        
        <p>Your booking is now confirmed. You can view your booking details by clicking the button below:</p>
        <a href="${bookingUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">View Booking</a>
        
        <p>Thank you for choosing OpenSpace!</p>
        <p>Best regards,<br>The OpenSpace Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error sending payment confirmation email:', error);
  }
};

// Send refund notification email
export const sendRefundNotificationEmail = async (
  to: string,
  refundDetails: {
    bookingId: string;
    roomName: string;
    amount: number;
    refundDate: string;
    reason: string;
    estimatedArrivalDate: string;
  }
): Promise<void> => {
  const {
    bookingId,
    roomName,
    amount,
    refundDate,
    reason,
    estimatedArrivalDate,
  } = refundDetails;
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const bookingUrl = `${baseUrl}/bookings/${bookingId}`;

  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject: '💰 Refund Processed for Your OpenSpace Booking',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Refund Confirmation</h2>
        <p>We're writing to confirm that a refund has been processed for your booking at <strong>${roomName}</strong>.</p>
        
        <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Refund Details</h3>
          <p><strong>Amount:</strong> ${formatCurrency(amount)}</p>
          <p><strong>Date:</strong> ${refundDate}</p>
          <p><strong>Reason:</strong> ${reason}</p>
          <p><strong>Estimated Arrival:</strong> ${estimatedArrivalDate}</p>
        </div>
        
        <p>Your refund has been processed and should be reflected in your original payment method. Please note that it may take a few business days for the refund to appear, depending on your bank or card issuer's policies.</p>
        
        <p>You can view your booking details by clicking the button below:</p>
        <a href="${bookingUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">View Booking</a>
        
        <p>If you have any questions about this refund, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The OpenSpace Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Refund notification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending refund notification email:', error);
  }
};

// Send host payout notification email
export const sendHostPayoutNotificationEmail = async (
  to: string,
  payoutDetails: {
    amount: number;
    payoutDate: string;
    estimatedArrivalDate: string;
  }
): Promise<void> => {
  const { amount, payoutDate, estimatedArrivalDate } = payoutDetails;
  const baseUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const earningsUrl = `${baseUrl}/host/earnings`;

  const mailOptions = {
    from: `"OpenSpace" <${VERIFIED_SENDER}>`,
    to,
    subject: '💸 Host Payout Processed - OpenSpace',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>Payout Confirmation</h2>
        <p>Good news! We've processed a payout for your hosting earnings.</p>
        
        <div style="background-color: #f0f8ff; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3>Payout Details</h3>
          <p><strong>Amount:</strong> ${formatCurrency(amount)}</p>
          <p><strong>Date Processed:</strong> ${payoutDate}</p>
          <p><strong>Estimated Arrival:</strong> ${estimatedArrivalDate}</p>
        </div>
        
        <p>The funds have been sent to your registered payment method. Please note that it may take a few business days for the funds to appear in your account, depending on your bank's processing times.</p>
        
        <p>You can view your complete earnings history by clicking the button below:</p>
        <a href="${earningsUrl}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin: 20px 0;">View Earnings</a>
        
        <p>Thank you for being a valued host on OpenSpace!</p>
        <p>Best regards,<br>The OpenSpace Team</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`Host payout notification email sent to ${to}`);
  } catch (error) {
    console.error('Error sending host payout notification email:', error);
  }
};
