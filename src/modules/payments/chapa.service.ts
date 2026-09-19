// src/modules/payments/chapa.service.ts
import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

export interface InitializePaymentParams {
  amount: number;
  currency: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string;
  txRef: string;
  callbackUrl?: string;
  returnUrl?: string;
  customization?: {
    title?: string;
    description?: string;
  };
}

@Injectable()
export class ChapaService {
  private readonly logger = new Logger(ChapaService.name);
  private readonly baseUrl: string;
  private readonly secretKey: string;

  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {
    this.baseUrl =
      this.configService.get<string>('CHAPA_BASE_URL') ||
      'https://api.chapa.co/v1';
    this.secretKey =
      this.configService.get<string>('CHAPA_SECRET_KEY') || '';
  }

  // 1. Calls Chapa API to create the hosted checkout session (UC-15)
  async initializePayment(params: InitializePaymentParams) {
    try {
      const payload = {
        amount: params.amount.toString(),
        currency: params.currency || 'ETB',
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        phone_number: params.phone,
        tx_ref: params.txRef,
        callback_url: params.callbackUrl,
        return_url: params.returnUrl,
        'customization[title]': params.customization?.title || 'Rent Payment',
        'customization[description]':
          params.customization?.description || 'Monthly Rent',
      };

      const response = await firstValueFrom(
        this.httpService.post(`${this.baseUrl}/transaction/initialize`, payload, {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
            'Content-Type': 'application/json',
          },
        }),
      );

      return response.data;
    } catch (error: any) {
      const errDetail = JSON.stringify(error.response?.data || error.message);
      this.logger.error(`Chapa initialize failed: ${errDetail}`);
      throw new BadRequestException(
        error.response?.data?.message || error.response?.data || 'Failed to initialize payment with Chapa',
      );
    }
  }

  // 2. Calls Chapa's Verify API to independently confirm payment (BR-PAY-03)
  async verifyPayment(txRef: string) {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.baseUrl}/transaction/verify/${txRef}`, {
          headers: {
            Authorization: `Bearer ${this.secretKey}`,
          },
        }),
      );

      return response.data;
    } catch (error: any) {
      const errDetail = JSON.stringify(error.response?.data || error.message);
      this.logger.error(`Chapa verify failed for tx_ref ${txRef}: ${errDetail}`);
      throw new BadRequestException('Payment verification failed.');
    }
  }
}