import { obtenerProductos } from "./products.js";
import { AuthService } from "./auth.js";
import { Carrito } from "./cart.js";
import { renderProductos, renderCarrito, mostrarToast } from "./ui.js";
import { LocalStorageService } from "./storage.js";

const miCarrito = new Carrito();
let listaProductos = [];

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const contenedorProductos = document.getElementById("contenedor-productos");
        listaProductos = await obtenerProductos();

        if (listaProductos.length === 0) {
            mostrarToast("No hay productos disponibles en el catálogo.");
            return;
        }

        renderProductos(contenedorProductos, listaProductos, (id, talle) => {
            const agregado = miCarrito.agregar(id, listaProductos, talle);
            
            if (agregado) {
                mostrarToast("Producto agregado al carrito");
                renderCarrito(
                    document.getElementById("carrito-items"), 
                    miCarrito.getItems(), 
                    miCarrito.calcularTotal()
                );
            } else {
                mostrarToast("No hay suficiente stock para la variante seleccionada.");
            }
        });

    } catch (error) {
        console.error("Error al cargar la app:", error);
        mostrarToast("Error al conectar con la base de datos de productos.");
    }
});

// Implementación del modo oscuro
const btnTheme = document.getElementById("btn-theme");
if (btnTheme) {
    if (localStorage.getItem("dark-mode") === "true") {
        document.body.classList.add("dark-mode");
    }

    btnTheme.addEventListener("click", () => {
        document.body.classList.toggle("dark-mode");
        const isDark = document.body.classList.contains("dark-mode");
        localStorage.setItem("dark-mode", isDark);
    });
}

// Botones de autenticación
const btnOpenRegister = document.getElementById("btn-open-register");
const btnOpenLogin = document.getElementById("btn-open-login");
const btnLogout = document.getElementById("btn-logout");

if (btnOpenRegister) {
    btnOpenRegister.addEventListener("click", () => {
        const user = prompt("Ingrese su nombre de usuario (mínimo 3 caracteres):");
        const pass = prompt("Ingrese su contraseña (mínimo 4 caracteres):");

        if (user && pass) {
            const resultado = AuthService.registrar(user, pass);
            if (resultado === "ok") {
                mostrarToast("¡Registro exitoso! Ya puedes iniciar sesión.");
            } else {
                mostrarToast(`Error: ${resultado}`);
            }
        }
    });
}

if (btnOpenLogin) {
    btnOpenLogin.addEventListener("click", () => {
        const user = prompt("Ingrese su usuario:");
        const pass = prompt("Ingrese su contraseña:");

        if (user && pass) {
            const resultado = AuthService.login(user, pass);
            if (resultado === "ok") {
                mostrarToast("¡Sesión iniciada correctamente!");
                
                btnOpenRegister.style.display = "none";
                btnOpenLogin.style.display = "none";
                if (btnLogout) {
                    btnLogout.style.display = "inline-block";
                }
            } else {
                mostrarToast("Error en las credenciales. Verifique los datos.");
            }
        }
    });
}

if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        AuthService.logout();
        mostrarToast("Sesión cerrada.");
        
        btnLogout.style.display = "none";
        if (btnOpenRegister) {
            btnOpenRegister.style.display = "inline-block";
        }
        if (btnOpenLogin) {
            btnOpenLogin.style.display = "inline-block";
        }

        const carritoItems = document.getElementById("carrito-items");
        if (carritoItems) {
            carritoItems.innerHTML = "<p>El carrito está vacío.</p>";
        }
        const total = document.getElementById("total");
        if (total) {
            total.textContent = "$0";
        }
    });
}

// Botón para finalizar compra
const btnComprar = document.getElementById("btn-comprar");
if (btnComprar) {
    btnComprar.addEventListener("click", async () => {
        const usuarioActual = LocalStorageService.obtener("usuario");
        
        if (!usuarioActual) {
            mostrarToast("Debes iniciar sesión para finalizar la compra.");
            return;
        }

        mostrarToast("Estamos procesando tu pedido, por favor espera...");

        try {
            const resultado = await miCarrito.finalizarCompra(listaProductos);
            mostrarToast(resultado.mensaje);
            renderCarrito(document.getElementById("carrito-items"), miCarrito.getItems(), miCarrito.calcularTotal());
        } catch (error) {
            mostrarToast("Error: " + error);
        }
    });
}
// Vaciar carro
const btnVaciar = document.getElementById("btn-vaciar");
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        miCarrito.vaciar();
        mostrarToast("El carrito se ha vaciado.");
        
        // Actualizamos la vista del carrito y el total a $0
        renderCarrito(
            document.getElementById("carrito-items"), 
            miCarrito.getItems(), 
            miCarrito.calcularTotal()
        );
    });
}