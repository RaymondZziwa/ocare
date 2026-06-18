import { Prisma } from '@prisma/client';

export const removeSensitiveFields = Prisma.defineExtension({
  name: 'remove-sensitive-fields',
  result: {
    employee: {
      password: {
        needs: { password: true },
        compute() {
          return undefined;
        },
      },
    },
    // Add other models with sensitive fields as needed
  },
});
