import { HttpException, HttpStatus, NotFoundException } from '@nestjs/common';
import { HttpExceptionFilter } from '../http-exception.filter';

describe('HttpExceptionFilter', () => {
  let filter: HttpExceptionFilter;
  let mockResponse: any;
  let mockHost: any;

  beforeEach(() => {
    filter = new HttpExceptionFilter();
    mockResponse = {
      headersSent: false,
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      end: jest.fn(),
    };
    mockHost = {
      switchToHttp: () => ({
        getResponse: () => mockResponse,
        getRequest: () => ({ headers: {} }),
      }),
    };
  });

  it('sanitizes 404 error responses', () => {
    filter.catch(new NotFoundException('Not found'), mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.NOT_FOUND);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Resource not found',
      }),
    );
  });

  it('handles general HttpExceptions and escapes XSS content', () => {
    filter.catch(
      new HttpException('<script>alert("XSS")</script>', HttpStatus.BAD_REQUEST),
      mockHost,
    );
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.BAD_REQUEST);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        message: expect.not.stringContaining('<script>'),
      }),
    );
  });

  it('translates SQL Server unique constraint error 2627 to 409 Conflict', () => {
    const error = {
      driverError: { number: 2627 },
    };
    filter.catch(error, mockHost);
    expect(mockResponse.status).toHaveBeenCalledWith(HttpStatus.CONFLICT);
    expect(mockResponse.json).toHaveBeenCalledWith(
      expect.objectContaining({
        statusCode: HttpStatus.CONFLICT,
        error: 'Conflict',
        message: 'A record with this identifier or name already exists.',
      }),
    );
  });
});
