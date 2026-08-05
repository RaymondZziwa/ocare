import { Injectable } from '@nestjs/common';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';
import { VerificationService } from 'src/web-app/auth/verification.service';

@Injectable()
export class ResendMailService {
  year = new Date().getFullYear();
  private resend: Resend;

  constructor(
    private readonly configService: ConfigService,
    private readonly verificationService: VerificationService,
  ) {
    // Initialize Resend after config is available
    this.resend = new Resend(this.configService.getOrThrow('RESEND_API_KEY'));
  }

  private async loadTemplate(
    templateName: string,
    variables: Record<string, unknown>,
  ): Promise<string> {
    const templatePath = path.join(
      __dirname,
      'templates',
      `${templateName}.hbs`,
    );
    const templateContent = await fs.readFile(templatePath, 'utf-8');
    const compiledTemplate = Handlebars.compile(templateContent);
    return compiledTemplate(variables);
  }

  // Example of a basic send method (if needed)
  async sendBasicEmail(to: string, subject: string, html: string) {
    try {
      const { data, error } = await this.resend.emails.send({
        from: this.configService.getOrThrow('FROM_EMAIL'),
        to,
        subject,
        html,
      });
      if (error) throw new Error(error.message);
      return data;
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendOnRegistration(name: string, email: string, id: string) {
    try {
      const html = await this.loadTemplate('welcomeEmail', {
        firstName: name,
        year: this.year,
        verificationLink: this.verificationService.getVerificationLink(id),
      });
      await this.resend.emails.send({
        from: this.configService.getOrThrow('FROM_EMAIL'),
        to: email,
        subject: 'Welcome to Ocare',
        html,
      });
      console.log('Registration email sent to:', email);
    } catch (error) {
      console.error('Error sending registration email:', error);
      throw new Error('Failed to send registration email');
    }
  }

  async sendOnForgotPassword(name: string, email: string, id: string) {
    try {
      const html = await this.loadTemplate('passwordReset', {
        firstName: name,
        resetLink: this.verificationService.getResetLink(id),
        year: this.year,
      });
      await this.resend.emails.send({
        from: this.configService.getOrThrow('FROM_EMAIL'),
        to: email,
        subject: 'Reset Your Password – Ocare Pharmacy',
        html,
      });
    } catch (error) {
      console.error('Error sending password reset email:', error);
      throw new Error('Failed to send password reset email');
    }
  }

  async sendOnEmailChange(name: string, email: string, id: string) {
    try {
      const html = await this.loadTemplate('updateEmail', {
        firstName: name,
        year: this.year,
        newEmail: email,
        verificationLink: this.verificationService.getNewEmailVerificationLink(
          id,
          email,
        ),
      });
      await this.resend.emails.send({
        from: this.configService.getOrThrow('FROM_EMAIL'),
        to: email,
        subject: 'Account email upate',
        html,
      });
      console.log('Email change request sent to:', email);
    } catch (error) {
      console.error('Error sending email update:', error);
      throw new Error('Failed to send email update');
    }
  }

  // Optional: send order confirmation with PDF attachment
  async sendOrderConfirmation(
    name: string,
    email: string,
    orderData: any,
    pdfBuffer: Buffer,
  ) {
    try {
      const html = await this.loadTemplate('receipt', {
        firstName: name,
        orderDate: orderData.date,
        orderItems: orderData.items,
        totalAmount: orderData.total,
        year: this.year,
      });
      await this.resend.emails.send({
        from: 'sales@ocareug.com',
        to: email,
        subject: `Your Ocare Order Confirmation`,
        html,
        attachments: [
          {
            filename: `receipt-${name}.pdf`,
            content: pdfBuffer,
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      throw new Error('Failed to send order confirmation');
    }
  }

  async sendOnOrderPlacement() {
    try {
      const html = await this.loadTemplate('orderPlacement', {
        portalUrl: 'https://ocareportal.megaerp.com',
        year: this.year,
      });
      await this.resend.emails.send({
        from: this.configService.getOrThrow('FROM_EMAIL'),
        to: 'ocareug@gmail.com',
        subject: 'New Online Order Placed',
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send email');
    }
  }

  async sendQuotation(params: {
    to: string; // recipient email
    draft: any; // the draft object from DB
    pdfBuffer: Buffer; // the generated PDF buffer
    subject?: string; // optional custom subject
  }): Promise<void> {
    const { to, draft, pdfBuffer, subject } = params;
    const finalSubject = subject || 'Quotation from Ocare Pharmacy';

    // Quotation metadata
    const quotationNumber = `Q-${Date.now().toString().slice(-8)}-${draft.id.slice(-4)}`;
    const quotationDate = new Date().toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    const validUntil = new Date(
      Date.now() + 14 * 24 * 60 * 60 * 1000,
    ).toLocaleDateString('en-UG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    // Compute totals
    const subtotal = draft.cart.reduce(
      (sum, item) => sum + (item.quantity || 1) * (item.sellingPrice || 0),
      0,
    );
    const discount = 0; // can be extended if needed
    const tax = 0;
    const grandTotal = subtotal - discount + tax;

    const lineItems = (draft.cart || []).map((item) => ({
      name: item.name || 'Product',
      quantity: item.quantity || 1,
      unitPrice: (item.sellingPrice || 0).toFixed(2),
      totalPrice: ((item.quantity || 1) * (item.sellingPrice || 0)).toFixed(2),
    }));

    try {
      // Load the generic template – no customerName needed
      const html = await this.loadTemplate('quotation', {
        quotationNumber,
        quotationDate,
        validUntil,
        lineItems,
        subtotal: subtotal.toFixed(2),
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        grandTotal: grandTotal.toFixed(2),
        year: new Date().getFullYear(),
      });

      // Send email with Resend
      await this.resend.emails.send({
        from: this.configService.getOrThrow('FROM_EMAIL'),
        to,
        subject: finalSubject,
        html,
        attachments: [
          {
            filename: `Quotation-${draft.id.slice(-8)}.pdf`,
            content: pdfBuffer.toString('base64'),
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      console.error('Error sending quotation email:', error);
      throw new Error('Failed to send quotation email');
    }
  }
}
