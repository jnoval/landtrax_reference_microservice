import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements OnModuleDestroy {
  private readonly _logger = new Logger(RedisCacheService.name);
  private client: Redis | null = null;
  private isConnected = false;

  constructor(private readonly configService: ConfigService) {
    this.initClient();
  }

  private initClient() {
    try {
      const host = this.configService.get<string>('redis.host') || process.env.REDIS_HOST || 'localhost';
      const port = Number(this.configService.get<number>('redis.port') || process.env.REDIS_PORT || 6379);
      const password = this.configService.get<string>('redis.password') || process.env.REDIS_PASSWORD || undefined;

      this.client = new Redis({
        host,
        port,
        password,
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: (times) => {
          if (times > 3) return null;
          return Math.min(times * 100, 1000);
        },
      });

      this.client.connect().then(() => {
        this.isConnected = true;
        this._logger.log('Connected to Redis cache');
      }).catch((err) => {
        this.isConnected = false;
        this._logger.warn(`Redis connection failed (caching disabled): ${err.message}`);
      });

      this.client.on('error', (err) => {
        this.isConnected = false;
        this._logger.warn(`Redis client error: ${err.message}`);
      });
    } catch (e: any) {
      this._logger.warn(`Failed to initialize Redis client: ${e.message}`);
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    if (!this.isConnected || !this.client) return null;
    try {
      const data = await this.client.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err: any) {
      this._logger.warn(`Error reading key ${key} from Redis: ${err.message}`);
      return null;
    }
  }

  async set(key: string, value: any, ttlSeconds?: number): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      const serialized = JSON.stringify(value);
      if (ttlSeconds && ttlSeconds > 0) {
        await this.client.set(key, serialized, 'EX', ttlSeconds);
      } else {
        await this.client.set(key, serialized);
      }
    } catch (err: any) {
      this._logger.warn(`Error setting key ${key} in Redis: ${err.message}`);
    }
  }

  async del(key: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      await this.client.del(key);
    } catch (err: any) {
      this._logger.warn(`Error deleting key ${key} from Redis: ${err.message}`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    if (!this.isConnected || !this.client) return;
    try {
      const keys = await this.client.keys(pattern);
      if (keys.length > 0) {
        await this.client.del(...keys);
      }
    } catch (err: any) {
      this._logger.warn(`Error deleting pattern ${pattern} from Redis: ${err.message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit().catch(() => {});
    }
  }
}
