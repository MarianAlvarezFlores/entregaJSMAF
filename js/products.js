export class Producto {
    constructor(id, nombre, precio, variantes, categoria, img) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.variantes = variantes; // talle + stock
        this.categoria = categoria;
        this.img = img;
    }

    // Stock total con las variantes
    get stock() {
        return this.variantes.reduce((acc, v) => acc + v.stock, 0);
    }

    // Stock de un talle en particular
    obtenerStockPorTalle(talle) {
        const variante = this.variantes.find(v => v.talle === talle);
        return variante ? variante.stock : 0;
    }

    // Verifico que haya
    tieneStock(talle, cantidad = 1) {
        return this.obtenerStockPorTalle(talle) >= cantidad;
    }

    // Descuento el stock
    descontarStock(talle, cantidad) {
        const variante = this.variantes.find(v => v.talle === talle);

        if (!variante || variante.stock < cantidad) {
            return false;
        }

        variante.stock -= cantidad;
        return true;
    }

    calcularSubtotal(cantidad) {
        return this.precio * cantidad;
    }
}

export const obtenerProductos = async () => {
    try {
        const response = await fetch("./productos.json");
        
        if (!response.ok) {
            throw new Error("No se pudo cargar el catálogo de productos desde el JSON.");
        }
        
        const data = await response.json();
        return data.map(item => new Producto(
            item.id, 
            item.nombre, 
            item.precio, 
            item.variantes, 
            item.categoria, 
            item.img
        ));
        
    } catch (error) {
            // En lugar de imprimir en consola, lanzamos el error hacia quien llamó a la función
            throw error;
    }
};