  // async create(createSaleDto: CreateSaleDto) {
  //   const {
  //     customerId,
  //     servedBy,
  //     storeId,
  //     items,
  //     paymentMethods,
  //     notes,
  //     total,
  //     totalWithCharges,
  //     balance,
  //     status,
  //     phoneNumber,
  //   } = createSaleDto;

  //   return this.prisma.$transaction(async (tx) => {
  //     // If totalWithCharges is provided, process payment gateway first
  //     let paymentResult: CollectionResponse = {
  //       status: 'success',
  //       message: '',

  //       data: {
  //         transaction: {
  //           uuid: '',
  //           reference: '',
  //           status: 'processing',
  //           provider_reference: '',
  //         },

  //         collection: {
  //           amount: {
  //             total: 0,
  //             currency: '',
  //           },

  //           provider: '',
  //           phone_number: '',
  //           mode: '',
  //         },

  //         timeline: {
  //           initiated_at: '',
  //           estimated_settlement: '',
  //         },

  //         metadata: {
  //           response_timestamp: '',
  //           sandbox_mode: false,
  //         },
  //       },
  //     };
  //     let amountToProcess = total;

  //     if (totalWithCharges && totalWithCharges > total) {
  //       amountToProcess = totalWithCharges;
  //       paymentResult = await collectPayment(
  //         this.httpService,
  //         this.configService,
  //         {
  //           amount: amountToProcess,
  //           //method: 'Mobile_Money',
  //           country: 'UG',
  //           description: 'POS Sale Payment',
  //           phone_number: phoneNumber,
  //         },
  //       );

  //       console.log('result', paymentResult);

  //       // The initial request always returns success, real status comes from callback
  //       // We proceed with the sale and wait for callback to confirm payment status
  //       // Store the transaction reference for tracking
  //       const transactionReference = paymentResult.data.transaction.reference;
  //     }
  //     // 1️⃣ Fetch inventory matching itemId + unitId in this store
  //     const inventories = await tx.productInventory.findMany({
  //       where: {
  //         storeId,
  //         OR: items.map((item) => ({
  //           itemId: item.id,
  //           unitId: item.unitId,
  //         })),
  //       },
  //     });

  //     // Build lookup map: "itemId-unitId" → inventory
  //     const inventoryMap = new Map(
  //       inventories.map((inv) => [`${inv.itemId}-${inv.unitId}`, inv]),
  //     );

  //     // 2️⃣ Check stock availability
  //     for (const saleItem of items) {
  //       const key = `${saleItem.id}-${saleItem.unitId}`;
  //       const inventory = inventoryMap.get(key);

  //       if (!inventory || inventory.qty < saleItem.quantity) {
  //         throw new BadRequestException(
  //           `Insufficient stock for item "${saleItem.name}". Available: ${inventory?.qty ?? 0}, Required: ${saleItem.quantity}`,
  //         );
  //       }
  //     }

  //     // 3️⃣ Reduce inventory quantities
  //     for (const saleItem of items) {
  //       const key = `${saleItem.id}-${saleItem.unitId}`;
  //       const inventory = inventoryMap.get(key);

  //       if (!inventory) {
  //         throw new BadRequestException(
  //           `Inventory record not found for item "${saleItem.name}"`,
  //         );
  //       }

  //       await tx.productInventory.update({
  //         where: { id: inventory.id },
  //         data: {
  //           qty: inventory.qty - saleItem.quantity,
  //         },
  //       });
  //     }

  //     // 4️⃣ Create sale record
  //     const sale = await tx.sale.create({
  //       data: {
  //         clientId: customerId,
  //         servedBy,
  //         storeId,
  //         status,
  //         total,
  //         balance,
  //         paymentMethods: JSON.parse(JSON.stringify(paymentMethods)),
  //         notes,
  //         items: JSON.parse(JSON.stringify(items)),
  //       },
  //       include: {
  //         client: true,
  //         store: true,
  //         employee: true,
  //       },
  //     });

  //     // 5️⃣ Create payment records
  //     if (paymentMethods && paymentMethods.length > 0) {
  //       await Promise.all(
  //         paymentMethods.map((method) =>
  //           tx.salePayments.create({
  //             data: {
  //               saleId: sale.id,
  //               amount: method.amount,
  //               paymentMethod: method.type,
  //               referenceId: paymentResult
  //                 ? paymentResult.data.transaction.reference
  //                 : '',
  //               notes: paymentResult
  //                 ? `Transaction Ref: ${paymentResult.data.transaction.reference}`
  //                 : notes,
  //               cashierId: servedBy,
  //             },
  //           }),
  //         ),
  //       );
  //     }

  //     // 6️⃣ For async payments, wallet balance will be updated via callback
  //     // Don't update wallet here - wait for callback confirmation
  //     if (paymentResult) {
  //       console.log(
  //         `Payment initiated. Transaction Reference: ${paymentResult.data.transaction.reference}`,
  //       );
  //       console.log('Waiting for callback to confirm payment status...');
  //     }

  //     return {
  //       message: 'Sale created successfully',
  //       data: {
  //         ...sale,
  //         paymentInitiated: !!paymentResult,
  //         transactionReference: paymentResult
  //           ? paymentResult.data.transaction.reference
  //           : null,
  //         amountProcessed: amountToProcess,
  //         message: paymentResult
  //           ? `Payment initiated. Transaction Reference: ${paymentResult.data.transaction.reference}. Waiting for payment confirmation...`
  //           : 'No payment processing required',
  //       },
  //       status: 200,
  //     };
  //   });
  // }
