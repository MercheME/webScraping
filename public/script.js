/**
 * Formulario de búsqueda de productos.
 * @type {HTMLFormElement}
 */
const buscadorForm = document.getElementById('buscadorForm');

document.addEventListener('DOMContentLoaded', () => {
    mostrarProductosDesdeLocalStorage();
});

/**
 * Trunca el título del producto si es más largo que la longitud máxima.
 * @param {string} titulo - El título del producto.
 * @param {number} [maxLength=20] - La longitud máxima permitida.
 * @returns {string} El título truncado si excede la longitud máxima.
 */
function truncarTitulo(titulo, maxLength = 20) {
    return titulo.length > maxLength ? titulo.slice(0, maxLength) + "..." : titulo;
}

/**
 * Genera un UUID.
 * @returns {string} El UUID generado.
 */
function generarUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      var r = Math.random() * 16 | 0,
          v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

/**
 * Enlace para eliminar todos los productos.
 * @type {HTMLAnchorElement}
 */
const enlaceEliminar = document.getElementById('eliminar-btn');
enlaceEliminar.addEventListener('click', eliminarProductos);

/**
 * Elimina todos los productos del LocalStorage y recarga la página.
 */
function eliminarProductos() {
    localStorage.removeItem('productos');
    location.reload();

    alert("⚠️ Todos los productos han sido eliminados.");
}

/**
 * Muestra los productos guardados en el LocalStorage.
 */
function mostrarProductosDesdeLocalStorage() {
    // Recuperamos los productos guardados desde LocalStorage
    const productos = JSON.parse(localStorage.getItem('productos')) || [];

    const contenedor = document.getElementById('productos-lista');
    contenedor.innerHTML = '';  // Limpia

    productos.forEach(producto => {
        const productoHTML = `
            <div class="mt-1 flex flex-col ">
                <div class="flex justify-center p-4">
                    <a class="relative" href="producto.html?id=${producto.id}">
                        <span class="absolute top-0 left-0 mt-1 ml-1 h-full w-full rounded bg-black"></span>
                        <span class="fold-bold relative inline-block h-full w-full rounded border-2 border-black bg-white px-3 py-1 text-base font-bold text-black transition duration-100 hover:bg-yellow-400 hover:text-gray-900">${truncarTitulo(producto.titulo)}</span>
                    </a>
                </div>
            </div>
        `;

        contenedor.innerHTML += productoHTML;
    });
}

/**
 * Guarda un producto en el LocalStorage.
 * @param {Object} producto - El producto a guardar.
 * @param {string} producto.id - El ID del producto.
 * @param {string} producto.titulo - El título del producto.
 * @param {string} producto.precio - El precio del producto.
 * @param {string} producto.imagen - La URL de la imagen del producto.
 */
function guardarProductoLocalStorage(producto) {
    let productos = JSON.parse(localStorage.getItem('productos')) || [];

    const productoExistente = productos.find(item => item.id === producto.id);
    if (productoExistente) {
        alert("⚠️ Este producto ya está en tus favoritos.");
        return;
    }

    productos.push(producto);

    // Guardar los productos en el LocalStorage
    localStorage.setItem('productos', JSON.stringify(productos));
    alert("✅ Producto guardado en favoritos.");
}


buscadorForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const producto = document.getElementById('producto').value;

    const contenedorAmz = document.getElementById('productos-amazon');
    const contenedorAli = document.getElementById('productos-aliexpress');

    contenedorAmz.innerHTML = '<p>Buscando productos en Amazon, por favor espera...</p>';
    contenedorAli.innerHTML = '<p>Buscando productos en AliExpress, por favor espera...</p>';

    /**
     * Realiza la búsqueda de productos en el endpoint especificado.
     * @param {string} endpoint - El endpoint al que se debe hacer la solicitud.
     * @returns {Promise<Object>} La respuesta de la búsqueda en formato JSON.
     */
    async function fetchProductos(endpoint) {
        try {
            const respuesta = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ producto })
            });

            if (!respuesta.ok) {
            throw new Error(`Error en la solicitud: ${respuesta.statusText}`);
            }

            const datos = await respuesta.json();

            datos.resultados.forEach(producto => {
                if (!producto.id) {
                  producto.id =  generarUUID(); // Si no tiene id, generamos uno
                }
              });

            return datos;

        } catch (error) {
            console.error(`Error en la petición a ${endpoint}:`, error);
            //todo hacer un objeto error
            return { error: 'Error en la solicitud.' };
        }
    }

    const dataAmz = await fetchProductos('/buscar/amazon');
    const dataAli = await fetchProductos('/buscar/aliexpress');

    if (dataAmz.error) {
        contenedorAmz.innerHTML = '<p>Error al buscar en Amazon.</p>';
    } else {
        mostrarDatos(dataAmz.resultados, 'productos-amazon');
    }

    if (dataAli.error) {
        contenedorAli.innerHTML = '<p>Error al buscar en AliExpress.</p>';
    } else {
        mostrarDatos(dataAli.resultados, 'productos-aliexpress');
    }

});

/**
 * Muestra los datos de productos en el contenedor especificado.
 * @param {Array<Object>} datos - Los datos de los productos.
 * @param {string} contenedorId - El ID del contenedor donde se mostrarán los productos.
 */
function mostrarDatos(datos, contenedorId) {
    const contenedor = document.getElementById(contenedorId);

    contenedor.innerHTML = '';

    datos.forEach(item => {
    const elemento = document.createElement('div');

    const precioFormateado = parseFloat(item.precio);

    elemento.innerHTML = `
        <div class="flex-shrink-0 m-6 border relative overflow-hidden bg-orange-500 rounded-lg max-w-xs shadow-lg">
            <svg class="absolute bottom-0 left-0 mb-8" viewBox="0 0 375 283" fill="none"
                style="transform: scale(1.5); opacity: 0.1;">
                <rect x="159.52" y="175" width="152" height="152" rx="8" transform="rotate(-45 159.52 175)" fill="white" />
                <rect y="107.48" width="152" height="152" rx="8" transform="rotate(-45 0 107.48)" fill="white" />
            </svg>
            <div class="relative pt-10 px-10 flex items-center justify-center">
                <div class="block absolute w-48 h-48 bottom-0 left-0 -mb-24 ml-3"
                    style="background: radial-gradient(black, transparent 60%); transform: rotate3d(0, 0, 1, 20deg) scale3d(1, 0.6, 1); opacity: 0.2;">
                </div>
                <img class="relative w-40" src="${item.imagen}" alt="${item.titulo}">
            </div>
            <div class="relative px-6 pb-6 mt-6">
                <span class="block opacity-75 -mb-1">${item.titulo}</span>
                <div class="flex justify-between">
                    <span class="block font-semibold text-xl">${precioFormateado} €</span>
                    <span class="block text-orange-500 text-xs font-bold px-3 py-2 leading-none flex items-center">
                            <a href="#" 
                                type="button"
                                class="guardar-fab inline-flex items-center font-bold rounded-md border border-transparent bg-gray-800 px-3 py-2 text-sm font-medium leading-4 text-white shadow-sm hover:bg-gray-900" 
                                data-id="${item.id}" 
                                data-titulo="${item.titulo}" 
                                data-precio="${item.precio}" 
                                data-imagen="${item.imagen}"
                        >Guardar en favoritos</a>
                    </span>
                </div>
            </div>
        </div>
    `;

    contenedor.appendChild(elemento);
    });

    contenedor.addEventListener('click', (e) => {
        if (e.target && e.target.matches('.guardar-fab')) {
            e.preventDefault();  
            
            const producto = {
                id: e.target.getAttribute('data-id'),
                titulo: e.target.getAttribute('data-titulo'),
                precio: e.target.getAttribute('data-precio'),
                imagen: e.target.getAttribute('data-imagen')
            };

            console.log(producto);  
            guardarProductoLocalStorage(producto);

            mostrarProductosDesdeLocalStorage(); 
        }
    });
}


