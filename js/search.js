import { renderProductos } from "./ui.js";

export const SearchService = {

    /**
     * Inicializa el buscador de productos.
     *
     * @param {HTMLElement} input
     * @param {Array} listaProductos
     * @param {HTMLElement} contenedor
     * @param {Function} agregarAlCarrito
     * @param {Function} manejarWishlist
     */
    init(
        input,
        listaProductos,
        contenedor,
        agregarAlCarrito,
        manejarWishlist
    ) {

        if (!input || !contenedor) return;

        input.addEventListener("input", (e) => {

            const palabra = e.target.value
                .toLowerCase()
                .trim();

            const resultados = palabra === ""
                ? listaProductos
                : listaProductos.filter(producto =>
                    producto.nombre.toLowerCase().includes(palabra) ||
                    producto.categoria.toLowerCase().includes(palabra)
                );

            renderProductos(
                contenedor,
                resultados,
                agregarAlCarrito,
                manejarWishlist
            );
        });
    }
};