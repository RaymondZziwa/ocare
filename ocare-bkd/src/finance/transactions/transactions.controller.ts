import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { WithdrawToBankDto } from './dtos/transferToBank.dto';
import { TransactionService } from './transactions.service';
import { MobileMoneyPaymentDto } from './dtos/sendMomo.dto';

@Controller('api/transactions')
export class TransactionsController {
  constructor(private readonly transactionService: TransactionService) {}

  //Withdraw to Bank
  @Post('withdraw')
  withdrawToBank(@Body() data: WithdrawToBankDto) {
    return this.transactionService.withdraw(data);
  }

  //check transfer status, the id is the reference id of the transfer transaction
  @Get('transfer-status/:id')
  checkTransferStatus(@Param() id: string) {
    console.log('Data received in controller:', id);
  }

  //get all transactions
  @Get('all')
  findAllTransactions() {
    return this.transactionService.allTransactions();
  }

  //Transaction status callback endpoint for marz to call and update the transaction status in the database
  @Post('marz-callback')
  marzCallback(@Body() data: any) {
    //console.log('Marz callback data received:', data);
    return this.transactionService.marzCallback(data);
  }

  //check transfer status, the id is the reference id of the transfer transaction
  @Get('payment-status/:reference')
  checkPaymentStatus(@Param() reference: { reference: string }) {
    //console.log('Data received in controller:', reference);
    return this.transactionService.checkPaymentStatus(reference);
  }

  //check bank transfer status, the id is the reference id of the transfer transaction
  @Get('bank-transfer-status/:reference')
  checkBankTransferStatus(@Param() reference: { reference: string }) {
    //console.log('Data received in controller:', reference);
    return this.transactionService.checkPaymentStatus(reference);
  }

  @Post('send-mobile-money')
  sendMoneyToPersonViaMomo(@Body() data: MobileMoneyPaymentDto) {
    console.log(data)
    return this.transactionService.sendMoneyToPersonViaMomo(data);
  }
}
