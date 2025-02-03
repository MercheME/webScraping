const express = require('express');
const path = require('path');
const { scrappearAliExpress, scrappearAmazon } = require('./src/scrapers/scrapper');

const app = express();
const PORT = 3000;

/**
 * Middleware para servir archivos estáticos desde la carpeta "public".
 * @name express.static
 * @function
 * @param {string} path - Ruta a la carpeta de archivos estáticos.
 */
app.use(express.static(path.join(__dirname, 'public')));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/**
 * Ruta para servir la página principal.
 * @name get/
 * @function
 * @param {string} path - Ruta al archivo index.html.
 * @param {function} callback - Función que maneja la respuesta de la solicitud.
 */
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

/**
 * Ruta para buscar productos en Amazon.
 * @name post/buscar/amazon
 * @function
 * @param {string} path - Ruta al endpoint de búsqueda en Amazon.
 * @param {function} callback - Función que maneja la solicitud y respuesta.
 * @returns {Promise<void>} - Respuesta con los resultados de la búsqueda.
 * @throws {Error} Si ocurre un error durante el scraping en Amazon.
 */
app.post('/buscar/amazon', async (req, res) => {
  const { producto } = req.body;

  if (!producto) {
    return res.status(400).json({ error: 'El término de búsqueda es requerido.' });
  }

  try {
    const resultados = await scrappearAmazon(producto);
    res.json({ resultados });
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar el scraping en Amazon.' });
  }
});

/**
 * Ruta para buscar productos en AliExpress.
 * @name post/buscar/aliexpress
 * @function
 * @param {string} path - Ruta al endpoint de búsqueda en AliExpress.
 * @param {function} callback - Función que maneja la solicitud y respuesta.
 * @returns {Promise<void>} - Respuesta con los resultados de la búsqueda.
 * @throws {Error} Si ocurre un error durante el scraping en AliExpress.
 */
app.post('/buscar/aliexpress', async (req, res) => {
  const { producto } = req.body;

  if (!producto) {
    return res.status(400).json({ error: 'El término de búsqueda es requerido.' });
  }

  try {
    const resultados = await scrappearAliExpress(producto);
    res.json({ resultados });
  } catch (error) {
    res.status(500).json({ error: 'Error al realizar el scraping en AliExpress.' });
  }
});

/**
 * Inicia el servidor en el puerto especificado.
 * @name listen
 * @function
 * @param {number} port - El puerto en el que se ejecuta el servidor.
 * @param {function} callback - Función que se ejecuta cuando el servidor está en funcionamiento.
 */
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });