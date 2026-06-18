import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

interface CollectPaymentPayload {
  amount: number;
  //method: string;
  country: string;
  description?: string;
  phone_number?: string;
}

export async function collectPayment(
  httpService: HttpService,
  configService: ConfigService,
  body: CollectPaymentPayload,
) {
  const payload = {
    amount: body.amount,
    //method: body.method,
    country: 'UG',
    reference: uuidv4(),
    description: body.description,
    phone_number: body.phone_number,
    // ...(body.method !== 'card' && {
    //   phone_number: body.phone_number,
    // }),

    callback_url: configService.getOrThrow<string>('MARZ_CALLBACK_URL'),
  };

  console.log('py', payload);

  const authHeader = configService.get<string>('MARZ_AUTH_HEADER');

  const response = await firstValueFrom(
    httpService.post(
      configService.getOrThrow<string>('MARZ_COLLECTION_BASE_URL'),
      payload,
      {
        headers: {
          Authorization: `Basic ${authHeader}`,
          'Content-Type': 'application/json',
        },
      },
    ),
  );

  return response.data;
}
