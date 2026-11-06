import { Body, Controller, HttpCode, HttpStatus, Logger, Post } from '@nestjs/common';
import { AppPaymentsService } from './payments.service';

/**
 * Public endpoint Marz calls when a collection or transfer finishes.
 * Point MARZ_CALLBACK_URL (or MARZ_APP_CALLBACK_URL) at:
 *   https://<api-domain>/api/payments/marz/callback
 * Only references we created are acted on, and each payment settles once.
 */
@Controller('api/payments')
export class PaymentsCallbackController {
  private readonly logger = new Logger(PaymentsCallbackController.name);

  constructor(private readonly payments: AppPaymentsService) {}

  @Post('marz/callback')
  @HttpCode(HttpStatus.OK)
  async marzCallback(@Body() body: any) {
    try {
      return await this.payments.handleCallback(body);
    } catch (err) {
      this.logger.error(`Marz callback failed: ${(err as Error).message}`);
      return { status: 'error' };
    }
  }
}
