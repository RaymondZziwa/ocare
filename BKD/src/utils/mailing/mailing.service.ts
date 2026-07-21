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
      const html = await this.loadTemplate('order-confirmation', {
        firstName: name,
        orderNumber: orderData.number,
        orderDate: orderData.date,
        orderItems: orderData.items,
        totalAmount: orderData.total,
        year: this.year,
      });
      await this.resend.emails.send({
        from: this.configService.getOrThrow('FROM_EMAIL'),
        to: email,
        subject: `Order Confirmation #${orderData.number}`,
        html,
        attachments: [
          {
            filename: `receipt-${orderData.number}.pdf`,
            content: pdfBuffer.toString('base64'),
            //encoding: 'base64',
            contentType: 'application/pdf',
          },
        ],
      });
    } catch (error) {
      console.error('Error sending order confirmation:', error);
      throw new Error('Failed to send order confirmation');
    }
  }
}
