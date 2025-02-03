
/**
 * Obtiene el ID del producto desde la URL.
 * @returns {string} El ID del producto obtenido de la URL.
 */
function getIdProducto() {
    const params = new URLSearchParams(window.location.search);
    return params.get('id');
}

function getPrecioProducto() {
    const params = new URLSearchParams(window.location.search);
    return params.get('precio');
}

/**
 * Muestra los detalles del producto seleccionado.
 * Recupera el producto desde el LocalStorage y muestra su información en la página.
 */
function mostrarDetallesProducto() {
    const idProducto = getIdProducto();
    const productos = JSON.parse(localStorage.getItem('productos')) || [];

    const producto = productos.find(p => p.id == idProducto);
    const precioFormateado = parseFloat(producto.precio);

    if (producto) {
        const detalle = `
            <div class="bg-gray-100">
            <div class="container mx-auto px-4 py-8">
                <div class="flex flex-wrap">
                <div class="w-full md:w-1/2 mb-8">
                    <img src="${producto.imagen}" 
                        alt="${producto.titulo}"
                        class="w-3/4 md:w-2/3 lg:w-1/2 rounded-lg shadow-md mb-4" id="mainImage">
                </div>

                <div class="w-full md:w-1/2 px-4">
                    <h2 class="text-3xl font-bold mb-2">${producto.titulo}</h2>
                    <div class="mb-4">
                    <span class="text-2xl font-bold mr-2">${precioFormateado} €</span>
                    </div>

                    <div class="flex space-x-4 mb-6">
                        <button class="bg-indigo-600 flex gap-2 items-center text-white px-6 py-2 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                            Comparar precios
                        </button>
                    </div>

                    <div class="flex flex-wrap ">
                        <a href="index.html" class="relative">
                        <span class="absolute top-0 left-0 mt-1 ml-1 h-full w-full rounded bg-gray-700"></span>
                        <span class="fold-bold relative inline-block h-full w-full rounded border-2 border-black bg-black px-3 py-1 text-base font-bold text-white transition duration-100 hover:bg-gray-900 hover:text-yellow-500">Volver</span>
                        </a>
                    </div>

                </div>
                </div>
            </div>
            </div>
        `;

        document.getElementById('detalle-producto').innerHTML = detalle;
    } else {
        document.getElementById('detalle-producto').innerHTML = '<p>Producto no encontrado.</p>';
    }
}


// Llama a la función para mostrar los detalles del producto al cargar la página.
mostrarDetallesProducto();