const winston = require('winston');
const { redactSensitiveData, redactError } = require('./utils/logRedaction');

// Define log levels
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// Define colors for each level
const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'white',
};

// Tell winston that you want to link the colors
winston.addColors(colors);

// Production logging format: Structured JSON for log aggregation
// Console output is automatically aggregated by Render (30-day retention)
const productionFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format((info) => {
    // Redact sensitive data from log metadata
    if (info.metadata) {
      info.metadata = redactSensitiveData(info.metadata);
    }
    // Redact error objects
    if (info.error && info.error instanceof Error) {
      info.error = redactError(info.error);
    }
    // Add environment context
    info.environment = process.env.NODE_ENV || 'development';
    info.service = 'aperae-backend';
    info.version = process.env.APP_VERSION || '1.0.0';
    return info;
  })(),
  winston.format.json()
);

// Development format: Human-readable with colors
const developmentFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.colorize({ all: true }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.metadata ? ' ' + JSON.stringify(redactSensitiveData(info.metadata)) : ''}`
  )
);

// Use structured JSON in production (for log aggregation), human-readable in dev
const isProduction = process.env.NODE_ENV === 'production';
const consoleFormat = isProduction ? productionFormat : developmentFormat;

// Define which transports the logger must use
const transports = [
  // Console transport (primary for production - Render aggregates console logs)
  new winston.transports.Console({
    format: consoleFormat,
    // In production, always output JSON for better aggregation
    // In development, use colorized human-readable format
  }),
];

// Note: File transports removed for production because:
// 1. Render automatically aggregates console logs (30-day retention)
// 2. File storage is ephemeral on Render containers
// 3. Console output is more reliable for cloud platforms
// If you need longer retention, use an external service (Logtail, Datadog, etc.)

// Create the logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  levels,
  transports,
  exitOnError: false,
});

// Create a stream object with a 'write' function for Morgan
logger.stream = {
  write: (message) => {
    logger.http(message.trim());
  },
};

// Log uncaught exceptions and unhandled rejections
logger.exceptions.handle(
  new winston.transports.Console({
    format: isProduction ? productionFormat : winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

logger.rejections.handle(
  new winston.transports.Console({
    format: isProduction ? productionFormat : winston.format.combine(
      winston.format.timestamp(),
      winston.format.colorize(),
      winston.format.simple()
    ),
  })
);

module.exports = logger;





