import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import * as fs from 'fs-extra';
import * as path from 'path';
import * as Handlebars from 'handlebars';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  year = new Date().getFullYear();

  constructor(private readonly configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: this.configService.get<number>('SMTP_PORT'),
      secure: true,
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
      tls: {
        minVersion: 'TLSv1.2', // Zoho requires TLS 1.2+
        rejectUnauthorized: true,
        //ciphers: this.configService.get<string>('CIPHER_KEY'), /// Uncomment if you need to specify ciphers for gmail
      },
      authMethod: 'PLAIN',
    });
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
    const compiledTemplate: Handlebars.TemplateDelegate =
      Handlebars.compile(templateContent);
    return compiledTemplate(variables);
  }

  async sendOnRegistration(name: string, email: string) {
    try {
      // Load the HTML template
      const html = await this.loadTemplate('welcome', {
        name,
        year: this.year,
      });

      await this.transporter.sendMail({
        from: `"Street Match Africa" <${this.configService.get<string>('FROM_EMAIL')}>`,
        to: email,
        subject: 'Your Registration at Street Match Africa',
        html,
      });

      console.log('User Registration Email sent to: ', name);
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send user registration email');
    }
  }

  async sendOnEmailVerification(name: string, email: string, code: string) {
    try {
      // Load the HTML template
      const html = await this.loadTemplate('email-verification', {
        name,
        code,
        year: this.year,
      });

      await this.transporter.sendMail({
        from: `"Street Match Africa" <${this.configService.get<string>('FROM_EMAIL')}>`,
        to: email,
        subject: 'Email Verification',
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send user registration email');
    }
  }

  async sendOnForgotPassword(name: string, email: string, code: string) {
    try {
      // Load the HTML template
      const html = await this.loadTemplate('forgot-pwd', {
        name,
        code,
        year: this.year,
      });

      await this.transporter.sendMail({
        from: `"Street Match Africa" <${this.configService.get<string>('FROM_EMAIL')}>`,
        to: email,
        subject: 'Password Reset Request',
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send user registration email');
    }
  }

  async sendOnAccountVerification(name: string, email: string) {
    try {
      // Load the HTML template
      const html = await this.loadTemplate('forgot-pwd', {
        name,
        year: this.year,
      });

      await this.transporter.sendMail({
        from: `"Street Match Africa" <${this.configService.get<string>('FROM_EMAIL')}>`,
        to: email,
        subject: 'Your Account has been verified',
        html,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw new Error('Failed to send user registration email');
    }
  }
}
