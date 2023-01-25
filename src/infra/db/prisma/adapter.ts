import { prisma } from '~/infra/connectors/prisma'
import { ITransactionAdaptor } from '~/infra/repos/interfaces'

import { IPrismaClient } from './interfaces'

export class PrismaTransactionAdaptor implements ITransactionAdaptor {
  protected prisma: IPrismaClient

  constructor() {
    this.prisma = prisma
  }

  async createTransaction<T>(promise: () => Promise<T>): Promise<T> {
    return await this.prisma.$transaction(promise)
  }
}
