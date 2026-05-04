import { LocalStorageService } from "./storage.js";

export class Carrito {
    constructor() {
        this.items = LocalStorageService.obtener("carrito") || [];
    }

    agregar(id, productos, talleSeleccionado = "M") {
        const prod = productos.find(p => p.id === id);
        if (!prod) return false;

        if (!prod.tieneStock(talleSeleccionado, 1)) {
            return false;
        }

        const existente = this.items.find(p => p.id === id && p.talle === talleSeleccionado);

        if (existente) {
            existente.cantidad += 1;
        } else {
            this.items.push({
                ...prod,
                talle: talleSeleccionado,
                cantidad: 1
            });
        }

        this.guardarCarrito();
        prod.descontarStock(talleSeleccionado, 1);
        return true;
    }

    incrementarCantidad(id, productos) {
        const existente = this.items.find(p => p.id === id);
        if (existente) {
            const prod = productos.find(p => p.id === id);
            if (prod && prod.tieneStock(existente.talle, 1)) {
                existente.cantidad += 1;
                prod.descontarStock(existente.talle, 1);
                this.guardarCarrito();
            }
        }
    }

    decrementarCantidad(id, productos) {
        const existente = this.items.find(p => p.id === id);
        if (existente) {
            existente.cantidad -= 1;

            const prod = productos.find(p => p.id === id);
            if (prod) {
                const variante = prod.variantes.find(v => v.talle === existente.talle);
                if (variante) variante.stock += 1;
            }

            if (existente.cantidad <= 0) {
                const index = this.items.indexOf(existente);
                this.items.splice(index, 1);
            }

            this.guardarCarrito();
        }
    }

    calcularTotal() {
        return this.items.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    }

    finalizarCompra(catalogoProductos) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                try {
                    if (this.items.length === 0) {
                        throw new Error("El carrito está vacío. Agregue productos antes de comprar.");
                    }

                    this.items.forEach(itemEnCarrito => {
                        const productoReal = catalogoProductos.find(p => p.id === itemEnCarrito.id);
                        if (!productoReal || !productoReal.tieneStock(itemEnCarrito.talle, itemEnCarrito.cantidad)) {
                            throw new Error(`Stock insuficiente para el producto: ${itemEnCarrito.nombre} (Talle: ${itemEnCarrito.talle})`);
                        }
                    });

                    const codigoPedido = `PED-${Date.now().toString().slice(-6)}`;
                    const totalCompra = this.calcularTotal();

                    const comprobante = {
                        codigo: codigoPedido,
                        productos: this.getItems(),
                        total: totalCompra,
                        fecha: new Date().toLocaleDateString()
                    };

                    this.vaciar();

                    resolve({ 
                        mensaje: `¡Compra procesada! Código: ${codigoPedido}`, 
                        comprobante 
                    });

                } catch (error) {
                    reject(error.message);
                }
            }, 2000);
        });
    }

    vaciar() {
        this.items.length = 0;
        this.guardarCarrito();
    }

    getItems() {
        return [...this.items];
    }

    guardarCarrito() {
        LocalStorageService.guardar("carrito", this.items);
    }
}