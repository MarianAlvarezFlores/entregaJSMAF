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

        const agregarAlCarrito = (id, talle) => {
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
        };

        renderProductos(contenedorProductos, listaProductos, agregarAlCarrito);

        // Lógica de los filtros
        const btnTodos = document.getElementById("btn-todos");
        const btnArriba = document.getElementById("btn-arriba");
        const btnAbajo = document.getElementById("btn-abajo");
        const btnVestidos = document.getElementById("btn-vestidos");

        const aplicarFiltro = (categoria) => {
            if (categoria === "todos") {
                renderProductos(contenedorProductos, listaProductos, agregarAlCarrito);
            } else {
                const filtrados = listaProductos.filter(p => p.categoria === categoria);
                renderProductos(contenedorProductos, filtrados, agregarAlCarrito);
            }
        };

        if (btnTodos) btnTodos.addEventListener("click", () => aplicarFiltro("todos"));
        if (btnArriba) btnArriba.addEventListener("click", () => aplicarFiltro("partes de arriba"));
        if (btnAbajo) btnAbajo.addEventListener("click", () => aplicarFiltro("partes de abajo"));
        if (btnVestidos) btnVestidos.addEventListener("click", () => aplicarFiltro("vestidos"));

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
if (btnOpenRegister) {
    btnOpenRegister.addEventListener("click", () => {
        const email = prompt("Ingrese su correo electrónico:");
        const pass = prompt("Ingrese su contraseña (mínimo 4 caracteres):");

        if (email && pass) {
            const resultado = AuthService.registrar(email, pass);
            if (resultado === "ok") {
                mostrarToast("¡Registro exitoso! Ya puedes iniciar sesión.");
            } else {
                mostrarToast(`Error: ${resultado}`);
            }
        }
    });
}

const btnOpenLogin = document.getElementById("btn-open-login");
if (btnOpenLogin) {
    btnOpenLogin.addEventListener("click", () => {
        const email = prompt("Ingrese su correo electrónico:");
        const pass = prompt("Ingrese su contraseña:");

        if (email && pass) {
            const resultado = AuthService.login(email, pass);
            if (resultado === "ok") {
                mostrarToast("¡Sesión iniciada correctamente!");
                
                document.getElementById("btn-open-register").style.display = "none";
                btnOpenLogin.style.display = "none";
                const btnLogout = document.getElementById("btn-logout");
                if (btnLogout) {
                    btnLogout.style.display = "inline-block";
                }
            } else {
                mostrarToast("Error en las credenciales. Verifique los datos.");
            }
        }
    });
}

const btnLogout = document.getElementById("btn-logout");
if (btnLogout) {
    btnLogout.addEventListener("click", () => {
        AuthService.logout();
        mostrarToast("Sesión cerrada.");
        
        btnLogout.style.display = "none";
        const regBtn = document.getElementById("btn-open-register");
        if (regBtn) regBtn.style.display = "inline-block";
        const loginBtn = document.getElementById("btn-open-login");
        if (loginBtn) loginBtn.style.display = "inline-block";

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

// Procesar compra
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

// Vaciar carrito
const btnVaciar = document.getElementById("btn-vaciar");
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        miCarrito.vaciar();
        mostrarToast("El carrito se ha vaciado.");
        renderCarrito(
            document.getElementById("carrito-items"), 
            miCarrito.getItems(), 
            miCarrito.calcularTotal()
        );
    });
}