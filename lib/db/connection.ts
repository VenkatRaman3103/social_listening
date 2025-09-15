import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import postgres from 'postgres';
import * as schema from './schema';

const connectionString = process.env.DATABASE_URL!;

// Connection pool configuration - optimized for Render PostgreSQL
const connectionConfig = {
  prepare: false,
  max: 10, // Increased for better performance
  idle_timeout: 30, // Keep connections alive longer
  connect_timeout: 30, // Increased timeout for Render
  max_lifetime: 60 * 30, // Keep connections alive for 30 minutes
  onnotice: () => {}, // Disable notices to reduce noise
  transform: {
    undefined: null, // Transform undefined to null
  },
  // Add SSL configuration for Render
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
};

// Global connection manager
class DatabaseManager {
  private static instance: DatabaseManager;
  private client: postgres.Sql | null = null;
  private dbInstance: ReturnType<typeof drizzle> | null = null;
  private isConnecting = false;

  private constructor() {}

  static getInstance(): DatabaseManager {
    if (!DatabaseManager.instance) {
      DatabaseManager.instance = new DatabaseManager();
    }
    return DatabaseManager.instance;
  }

  async getDatabase() {
    if (!this.client || !this.dbInstance) {
      if (this.isConnecting) {
        // Wait for existing connection attempt
        return this.waitForConnection();
      }
      await this.createConnection();
    }
    return this.dbInstance!;
  }

  async isHealthy(): Promise<boolean> {
    try {
      if (!this.dbInstance) return false;
      await this.dbInstance.execute(sql`SELECT 1 as health_check`);
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }

  private async createConnection(retryCount = 0) {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    const maxRetries = 3;
    const retryDelay = Math.min(1000 * Math.pow(2, retryCount), 10000); // Exponential backoff, max 10s
    
    try {
      console.log(`Creating new database connection... (attempt ${retryCount + 1}/${maxRetries + 1})`);
      
      // Validate connection string
      if (!connectionString) {
        throw new Error('DATABASE_URL environment variable is not set');
      }
      
      this.client = postgres(connectionString, connectionConfig);
      this.dbInstance = drizzle(this.client, { schema });
      
      // Test the connection with timeout
      const testPromise = this.dbInstance.execute(sql`SELECT 1 as test`);
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection test timeout')), 15000)
      );
      
      await Promise.race([testPromise, timeoutPromise]);
      console.log('Database connection established successfully');
    } catch (error) {
      console.error(`Failed to create database connection (attempt ${retryCount + 1}):`, error);
      
      // Clean up failed connection
      if (this.client) {
        try {
          await this.client.end();
        } catch (cleanupError) {
          console.error('Error during cleanup:', cleanupError);
        }
      }
      this.client = null;
      this.dbInstance = null;
      
      // Retry logic
      if (retryCount < maxRetries) {
        console.log(`Retrying in ${retryDelay}ms...`);
        this.isConnecting = false;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        return this.createConnection(retryCount + 1);
      }
      
      throw error;
    } finally {
      this.isConnecting = false;
    }
  }

  private async waitForConnection() {
    let attempts = 0;
    while (this.isConnecting && attempts < 50) { // Wait up to 5 seconds
      await new Promise(resolve => setTimeout(resolve, 100));
      attempts++;
    }
    return this.dbInstance!;
  }

  async closeDatabase() {
    if (this.client) {
      console.log('Closing database connection...');
      try {
        await this.client.end();
      } catch (error) {
        console.error('Error closing database connection:', error);
      }
      this.client = null;
      this.dbInstance = null;
    }
  }
}

// Create singleton instance
const dbManager = DatabaseManager.getInstance();

// Export functions
export async function getDatabase() {
  return await dbManager.getDatabase();
}

export async function closeDatabase() {
  return await dbManager.closeDatabase();
}

export async function isDatabaseHealthy() {
  return await dbManager.isHealthy();
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('SIGINT', async () => {
    await closeDatabase();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    await closeDatabase();
    process.exit(0);
  });
}

// Export the database instance (async)
export const db = getDatabase();
