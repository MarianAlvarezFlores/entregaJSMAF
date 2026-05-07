import { renderProductos } from "./ui.js";

/**
 * Servicio de búsqueda por palabra clave
 */
export const SearchService = {
    /**
     * @param {HTMLElement} input - El input de texto
     * @param {Array} listaProductos - La lista original completa
     * @param {HTMLElement} contenedor - Donde se renderiza
     * @param {Function} agregarAlCarrito - Callback para los botones de compra
     */
    init(input, listaProductos, contenedor, agregarAlCarrito) {
        if (!input || !contenedor) return;

        input.addEventListener("input", (e) => {
            const palabra = e.target.value.toLowerCase().trim();

            // Si el input está vacío, mostramos todos
            if (palabra === "") {
                renderProductos(contenedor, listaProductos, agregarAlCarrito);
                return;
            }

            // Filtramos por nombre o categoría usando la palabra clave
            const resultados = listaProductos.filter(producto => 
                producto.nombre.toLowerCase().includes(palabra) || 
                producto.categoria.toLowerCase().includes(palabra)
            );

            // Actualizamos la vista
            renderProductos(contenedor, resultados, agregarAlCarrito);
        });
    }
};