import {
  ArgumentsHost,
  BadRequestException,
  Catch,
  ConflictException,
  ExceptionFilter,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import type { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter<Prisma.PrismaClientKnownRequestError> {
  private readonly logger = new Logger(PrismaExceptionFilter.name);

  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    const mappedException = this.mapException(exception);
    const response = host.switchToHttp().getResponse<Response>();

    response
      .status(mappedException.getStatus())
      .json(mappedException.getResponse());
  }

  private mapException(exception: Prisma.PrismaClientKnownRequestError) {
    switch (exception.code) {
      case 'P2002':
        return new ConflictException('Resource already exists');
      case 'P2003':
      case 'P2014':
        return new BadRequestException('Invalid resource relation');
      case 'P2025':
        return new NotFoundException('Resource not found');
      default:
        this.logger.error(
          `Unhandled Prisma error ${exception.code}`,
          exception.stack,
        );
        return new InternalServerErrorException('Database operation failed');
    }
  }
}
