import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { GenericResponse } from 'src/utils/genericResponse';

@Injectable()
export class WalletService {
  constructor(private readonly prismaService: PrismaService) {}

  async create(data: {
    channelId: number;
    name: string;
    purpose?: string;
  }): Promise<GenericResponse> {
    const branch = await this.prismaService.wallet.create({ data });
    return {
      status: 200,
      data: branch,
      message: 'Wallet created successfully',
    };
  }

  async findAll(): Promise<GenericResponse> {
    const wallets = await this.prismaService.wallet.findMany();
    return {
      status: 200,
      data: wallets,
      message: 'Wallets fetched successfully',
    };
  }

  async toggleWallet(id: string): Promise<GenericResponse> {
    return await this.prismaService.$transaction(async (tx) => {
      // Find the wallet to toggle
      const wallet = await tx.wallet.findUnique({
        where: { id: parseInt(id) },
      });

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }

      // If we're setting this wallet to true, we need to set all other wallets to false
      if (wallet.isForSales === false) {
        // Set all other wallets to false first
        await tx.wallet.updateMany({
          where: {
            id: { not: parseInt(id) },
            isForSales: true,
          },
          data: {
            isForSales: false,
          },
        });

        // Now set this wallet to true
        const updatedWallet = await tx.wallet.update({
          where: { id: parseInt(id) },
          data: {
            isForSales: true,
          },
        });

        return {
          status: 200,
          data: updatedWallet,
          message: 'Wallet set as sales wallet successfully',
        };
      } else {
        // If setting to false, just update this wallet
        const updatedWallet = await tx.wallet.update({
          where: { id: parseInt(id) },
          data: {
            isForSales: false,
          },
        });

        return {
          status: 200,
          data: updatedWallet,
          message: 'Wallet removed from sales role successfully',
        };
      }
    });
  }

  async toggleAppWallet(id: string): Promise<GenericResponse> {
    return await this.prismaService.$transaction(async (tx) => {
      // Find the wallet to toggle
      const wallet = await tx.wallet.findUnique({
        where: { id: parseInt(id) },
      });

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }

      // If we're setting this wallet to true, we need to set all other wallets to false
      if (wallet.isForAppSales === false) {
        // Set all other wallets to false first
        await tx.wallet.updateMany({
          where: {
            id: { not: parseInt(id) },
            isForAppSales: true,
          },
          data: {
            isForAppSales: false,
          },
        });

        // Now set this wallet to true
        const updatedWallet = await tx.wallet.update({
          where: { id: parseInt(id) },
          data: {
            isForAppSales: true,
          },
        });

        return {
          status: 200,
          data: updatedWallet,
          message: 'Wallet set as app sales wallet successfully',
        };
      } else {
        // If setting to false, just update this wallet
        const updatedWallet = await tx.wallet.update({
          where: { id: parseInt(id) },
          data: {
            isForAppSales: false,
          },
        });

        return {
          status: 200,
          data: updatedWallet,
          message: 'Wallet toggled successfully',
        };
      }
    });
  }

  async toggleWebWallet(id: string): Promise<GenericResponse> {
    return await this.prismaService.$transaction(async (tx) => {
      // Find the wallet to toggle
      const wallet = await tx.wallet.findUnique({
        where: { id: parseInt(id) },
      });

      if (!wallet) {
        throw new NotFoundException(`Wallet with ID ${id} not found`);
      }

      // If we're setting this wallet to true, we need to set all other wallets to false
      if (wallet.isForWebSales === false) {
        // Set all other wallets to false first
        await tx.wallet.updateMany({
          where: {
            id: { not: parseInt(id) },
            isForWebSales: true,
          },
          data: {
            isForWebSales: false,
          },
        });

        // Now set this wallet to true
        const updatedWallet = await tx.wallet.update({
          where: { id: parseInt(id) },
          data: {
            isForWebSales: true,
          },
        });

        return {
          status: 200,
          data: updatedWallet,
          message: 'Wallet set as web sales wallet successfully',
        };
      } else {
        // If setting to false, just update this wallet
        const updatedWallet = await tx.wallet.update({
          where: { id: parseInt(id) },
          data: {
            isForWebSales: false,
          },
        });

        return {
          status: 200,
          data: updatedWallet,
          message: 'Wallet toggled successfully',
        };
      }
    });
  }

  async update(
    id: number,
    data: { name?: string; location?: string },
  ): Promise<GenericResponse> {
    const wallet = await this.prismaService.wallet.update({
      where: { id },
      data,
    });
    return {
      status: 200,
      data: wallet,
      message: 'Wallet modified successfully',
    };
  }

  async remove(id: number): Promise<GenericResponse> {
    const wallet = await this.prismaService.wallet.delete({ where: { id } });
    return {
      status: 200,
      data: wallet,
      message: 'Wallet deleted successfully',
    };
  }
}
