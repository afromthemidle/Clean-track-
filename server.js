import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Railway asigna el puerto dinámicamente a través de process.env.PORT
// Si no existe (ej. en local), usará el 3000
const PORT = process.env.PORT || 3000;

// Health check endpoint para Railway
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

// Servir los archivos estáticos de la carpeta dist generada por Vite
app.use(express.static(path.join(__dirname, 'dist')));

// Redirigir cualquier otra ruta al index.html (necesario para React Router)
// En Express v5 el comodín correcto es *
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Es crucial escuchar en '0.0.0.0' para que Railway pueda enrutar el tráfico
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor escuchando en el puerto ${PORT}`);
}).on('error', (err) => {
  console.error('Error al iniciar el servidor:', err);
});
