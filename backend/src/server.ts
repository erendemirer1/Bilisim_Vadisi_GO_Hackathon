import dotenv from 'dotenv';
dotenv.config();

import express from "express";
import { initializeDatabase } from "./config/database.js";
import userRoutes from "./routes/routes.js";
import os from "os";

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const HOST = '0.0.0.0'; // Tüm networklerden erişim için

console.log('Environment Variables:');
console.log('JWT_SECRET:', process.env.JWT_SECRET || 'batuhan');
console.log('PORT:', PORT);

const JWT_SECRET = process.env.JWT_SECRET || 'batuhan';
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not set');
}

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
});

app.use(express.json());
app.use(userRoutes);
app.use((req, res, _next) => {
  res.status(404).json({
    status: 'FAIL',
    message: `İstek attığınız yol (${req.originalUrl}) bu sunucuda bulunamadı.`,
    timestamp: new Date().toISOString()
  });
});
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Sunucu Hatası:', err);
  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    status: 'FAIL',
    message: err.message || 'Sunucu tarafında beklenmedik bir hata oluştu.',
  });
});

const getNetworkIPs = () => {
  const interfaces = os.networkInterfaces();
  const ips: string[] = [];

  for (const name of Object.keys(interfaces)) {
    const nets = interfaces[name];
    if (nets) {
      for (const net of nets) {
        if (net.family === 'IPv4' && !net.internal) {
          ips.push(net.address);
        }
      }
    }
  }

  return ips;
};

const startServer = async () => {
  try {
    initializeDatabase();
    app.listen(PORT, HOST, () => {
      console.log('   Local Erişim;');
      console.log(`   http://localhost:${PORT}`);
      console.log(`   http://127.0.0.1:${PORT}\n`);

      const networkIPs = getNetworkIPs();
      if (networkIPs.length > 0) {
        console.log('   Network Erişim;');
        networkIPs.forEach(ip => {
          console.log(`   http://${ip}:${PORT}`);
        });
        console.log('');
      } else {
        console.log('Network IP bulunamadı.\n');
      }
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();