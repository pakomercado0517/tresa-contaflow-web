/**
 * Logger configurado para la aplicación
 * 
 * En desarrollo: logs legibles con pino-pretty (servidor) o console formateado (cliente)
 * En producción: logs estructurados en JSON
 * 
 * Funciona tanto en servidor (Node.js) como en cliente (browser)
 */

const isDevelopment = process.env.NODE_ENV === "development";
const isServer = typeof window === "undefined";

// Tipos para los métodos del logger
export interface Logger {
  info: (msg: string, ...args: unknown[]) => void;
  error: (msg: string, error?: Error | unknown, ...args: unknown[]) => void;
  warn: (msg: string, ...args: unknown[]) => void;
  debug: (msg: string, ...args: unknown[]) => void;
}

function createServerLogger(): Logger {
  // Solo importar pino en el servidor para evitar problemas de bundle
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const pino = require("pino");

  if (isDevelopment) {
    // Desarrollo: logs legibles con pino-pretty
    return pino({
      transport: {
        target: "pino-pretty",
        options: {
          colorize: true,
          translateTime: "HH:MM:ss.l",
          ignore: "pid,hostname",
          singleLine: false,
        },
      },
      level: "debug",
    });
  } else {
    // Producción: logs estructurados en JSON
    return pino({
      level: "info",
      formatters: {
        level: (label: string) => {
          return { level: label };
        },
      },
    });
  }
}

function createClientLogger(): Logger {
  // Código del cliente (Client Components)
  // En el cliente, usamos console pero con formato estructurado
  return {
    info: (msg: string, ...args: unknown[]) => {
      if (isDevelopment) {
        console.log(`[INFO] ${msg}`, ...args);
      } else {
        console.log(JSON.stringify({ level: "info", msg, ...args }));
      }
    },
    error: (msg: string, error?: Error | unknown, ...args: unknown[]) => {
      if (isDevelopment) {
        console.error(`[ERROR] ${msg}`, error, ...args);
      } else {
        const errorData = error instanceof Error
          ? {
              message: error.message,
              stack: error.stack,
              name: error.name,
            }
          : error;
        console.error(
          JSON.stringify({ level: "error", msg, error: errorData, ...args })
        );
      }
    },
    warn: (msg: string, ...args: unknown[]) => {
      if (isDevelopment) {
        console.warn(`[WARN] ${msg}`, ...args);
      } else {
        console.warn(JSON.stringify({ level: "warn", msg, ...args }));
      }
    },
    debug: (msg: string, ...args: unknown[]) => {
      if (isDevelopment) {
        console.debug(`[DEBUG] ${msg}`, ...args);
      }
      // En producción, no se muestran logs de debug en el cliente
    },
  };
}

// Crear logger según el entorno
const logger: Logger = isServer ? createServerLogger() : createClientLogger();

export { logger };
