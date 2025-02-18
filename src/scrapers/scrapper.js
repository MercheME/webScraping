const puppeteer = require('puppeteer');
const fs = require('fs');

/**
 * Retorna una promesa que se resuelve después de un cierto número de milisegundos.
 *
 * @param {number} ms - Tiempo en milisegundos para esperar
 * @returns {Promise<void>} Una promesa que resuelve despues del tiempo especificado 
 */
function tiempoEspera(ms) {
  return new Promise(function(resolve) {
    setTimeout(resolve, ms);
  });
}

/**
 * Realiza web scraping en AliExpress para obtener información sobre un producto.
 * @param {string} producto - El nombre del producto a buscar.
 * @returns {Promise<Array>} Una promesa que resuelve a una lista de objetos que contienen título, precio e imagen del producto.
 * @throws {Error} Si ocurre un error durante el scraping.
 */
async function scrappearAliExpress(producto) {
  const navegador = await puppeteer.launch();
  const pagina = await navegador.newPage();

  try {
    console.log('Navegando a AliExpress...');
    await pagina.goto('https://www.aliexpress.com/');

    console.log('Esperando a que el contenido se cargue...');
    await tiempoEspera(5000);

    // Selector del buscador en AliExpress
    const searchSelector = 'input[type="text"]';

    console.log('Esperando a que el campo de búsqueda esté disponible...');
    await pagina.waitForSelector(searchSelector, { visible: true });

    console.log(`Buscando producto en Aliexpress: ${producto}`);
    await pagina.type(searchSelector, producto, { delay: 100 });
    await pagina.keyboard.press('Enter');

    console.log('Esperando que los resultados se carguen...');
    await pagina.waitForSelector('.list--galleryWrapper--29HRJT4', { visible: true });

    console.log('Extrayendo información de AliExpress...');
    const productos = await pagina.evaluate(() => {
      const items = [];

      const productosHtml = document.querySelectorAll('.multi--modalContext--1Hxqhwi');

      productosHtml.forEach((producto) => {
        const titulo = producto.querySelector('.multi--title--G7dOCj3')?.innerText.trim() || 'Sin título';
        const precio = producto.querySelector('.multi--price--1okBCly')?.innerText.trim() || 'Sin precio';
        const imagen = producto.querySelector('img.images--item--3XZa6xf')?.getAttribute('src') || 'Sin imagen';

        items.push({ titulo, precio, imagen });
      });

      return items.filter(item =>
        item.titulo !== 'Sin título' &&
        item.precio !== 'Sin precio' &&
        item.imagen !== 'Sin imagen'
      );

    });

    // Guardar resultados en archivo JSON
    fs.writeFileSync('data/productos_aliexpress.json', JSON.stringify(productos, null, 2), 'utf-8');

    return productos;
  } catch (error) {
    console.error('Error durante el scraping de AliExpress:', error.message);
    throw error;
  } finally {
    console.log('Cerrando el navegador de AliExpress...');
    await navegador.close();
  }
}

/**
 * Realiza web scraping en Amazon para obtener información sobre un producto.
 * @param {string} producto - El nombre del producto a buscar.
 * @returns {Promise<Array>} Una promesa que resuelve a una lista de objetos que contienen título, precio e imagen del producto.
 * @throws {Error} Si ocurre un error durante el scraping.
 */
async function scrappearAmazon(producto) {
  const navegador = await puppeteer.launch();
  const pagina = await navegador.newPage();
  
  try {
    console.log('Navegando a Amazon...');
    await pagina.goto('https://www.amazon.es/');
    console.log('Esperando a que el contenido se cargue...');
    await tiempoEspera(5000);

    // Selector del buscador en Amazon
    const searchSelector = 'input[name="field-keywords"]';

    console.log('Esperando a que el campo de búsqueda esté disponible...');
    await pagina.waitForSelector(searchSelector, { visible: true, timeout: 60000 });

    console.log(`Buscando producto en Amazon: ${producto}`);
    await pagina.type(searchSelector, producto, { delay: 100 });
    await pagina.keyboard.press('Enter');

    console.log('Esperando que los resultados se carguen...');
    await pagina.waitForNavigation({ waitUntil: 'domcontentloaded' });
    

    console.log('Extrayendo información de Amazon...');
    const productos = await pagina.evaluate(() => {
      const items = [];
      const productosHtml = document.querySelectorAll('.s-main-slot .s-result-item');

      productosHtml.forEach((producto) => {
        const titulo = producto.querySelector('h2 span')?.innerText || 'Sin título';
        const precio = producto.querySelector('.a-price-whole')?.innerText || 'Sin precio';
        const imagen = producto.querySelector('.s-image')?.getAttribute('src') || 'Sin imagen';

        items.push({ titulo, precio, imagen });
      });

      return items.filter(item =>
        item.titulo !== 'Sin título' &&
        item.precio !== 'Sin precio' &&
        item.imagen !== 'Sin imagen'
      );
    });

    fs.writeFileSync('data/productos.json', JSON.stringify(productos, null, 2), 'utf-8');
    console.log('Productos guardados en "data/productos.json".');

    return productos;
  } catch (error) {
    console.error('Error durante el scraping de Amazon:', error.message);
    throw error;
  } finally {
    console.log('Cerrando el navegador de Amazon...');
    await navegador.close();
  }
}

module.exports = {
  scrappearAliExpress,
  scrappearAmazon
};
