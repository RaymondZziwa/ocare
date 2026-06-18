import { Module } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { DashboardService } from './dashboard/dashboard.service';
import { DashboardController } from './dashboard/dashboard.controller';
import { ReportsController } from './reports.controller';
import { ReportService } from './reports.service';
import { PdfService } from 'src/utils/pdfGenerator/generator.service';
import { CompanyService } from 'src/company-profile/profile.service';
import { ReportStorageService } from './reportPdfGeneration.service';
//import { WhatsAppService } from './whatsapp.service';

@Module({
  controllers: [DashboardController, ReportsController],
  providers: [
    DashboardService,
    PrismaService,
    ReportService,
    PdfService,
    CompanyService,
    ReportStorageService,
    //WhatsAppService,
  ],
})
export class ReportsModule {}
