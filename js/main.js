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

        if (contenedorProductos) {
            renderProductos(contenedorProductos, listaProductos, agregarAlCarrito);
        }

        // Lógica de los filtros
        const btnTodos = document.getElementById("btn-todos");
        const btnArriba = document.getElementById("btn-arriba");
        const btnAbajo = document.getElementById("btn-abajo");
        const btnVestidos = document.getElementById("btn-vestidos");

        const aplicarFiltro = (categoria) => {
            if (!contenedorProductos) return;

            if (categoria === "todos") {
                renderProductos(contenedorProductos, listaProductos, agregarAlCarrito);
            } else {
                const filtrados = listaProductos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
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

// Botones de autenticación con SweetAlert2
const btnOpenRegister = document.getElementById("btn-open-register");
const btnOpenLogin = document.getElementById("btn-open-login");
const btnLogout = document.getElementById("btn-logout");

if (btnOpenRegister) {
    btnOpenRegister.addEventListener("click", async () => {
        const { value: formValues } = await Swal.fire({
            title: "Registrarse",
            html: `
                <input id="swal-email" class="swal2-input" placeholder="Correo Electrónico" type="email">
                <div style="position: relative; display: inline-block; width: 100%;">
                    <input id="swal-password" class="swal2-input" placeholder="Contraseña" type="password" style="margin: 0 auto; width: 80%;">
                    <button type="button" id="swal-toggle-pass" style="position: absolute; right: 10px; top: 15px; border: none; background: none; cursor: pointer;">👁️</button>
                </div>
            `,
            focusConfirm: false,
            didOpen: () => {
                const toggleBtn = document.getElementById("swal-toggle-pass");
                if (toggleBtn) {
                    toggleBtn.addEventListener("click", () => {
                        const passInput = document.getElementById("swal-password");
                        if (passInput.type === "password") {
                            passInput.type = "text";
                            toggleBtn.textContent = "🙈";
                        } else {
                            passInput.type = "password";
                            toggleBtn.textContent = "👁️";
                        }
                    });
                }
            },
            preConfirm: () => {
                const email = document.getElementById("swal-email").value;
                const pass = document.getElementById("swal-password").value;
                if (!email || !pass) {
                    Swal.showValidationMessage("Por favor, complete todos los campos");
                }
                return { email, pass };
            }
        });

        if (formValues) {
            const resultado = AuthService.registrar(formValues.email, formValues.pass);
            if (resultado === "ok") {
                Swal.fire("¡Éxito!", "Registro exitoso. Ya puedes iniciar sesión.", "success");
            } else {
                Swal.fire("Error", `No se pudo registrar: ${resultado}`, "error");
            }
        }
    });
}

if (btnOpenLogin) {
    btnOpenLogin.addEventListener("click", async () => {
        const { value: formValues } = await Swal.fire({
            title: "Iniciar Sesión",
            html: `
                <input id="swal-email" class="swal2-input" placeholder="Correo Electrónico" type="email">
                <div style="position: relative; display: inline-block; width: 100%;">
                    <input id="swal-password" class="swal2-input" placeholder="Contraseña" type="password" style="margin: 0 auto; width: 80%;">
                    <button type="button" id="swal-toggle-pass" style="position: absolute; right: 10px; top: 15px; border: none; background: none; cursor: pointer;">👁️</button>
                </div>
            `,
            focusConfirm: false,
            didOpen: () => {
                const toggleBtn = document.getElementById("swal-toggle-pass");
                if (toggleBtn) {
                    toggleBtn.addEventListener("click", () => {
                        const passInput = document.getElementById("swal-password");
                        if (passInput.type === "password") {
                            passInput.type = "text";
                            toggleBtn.textContent = "🙈";
                        } else {
                            passInput.type = "password";
                            toggleBtn.textContent = "👁️";
                        }
                    });
                }
            },
            preConfirm: () => {
                const email = document.getElementById("swal-email").value;
                const pass = document.getElementById("swal-password").value;
                if (!email || !pass) {
                    Swal.showValidationMessage("Por favor, ingrese email y contraseña");
                }
                return { email, pass };
            }
        });

        if (formValues) {
            const resultado = AuthService.login(formValues.email, formValues.pass);
            if (resultado === "ok") {
                Swal.fire("¡Bienvenido!", "Sesión iniciada correctamente.", "success");
                
                btnOpenRegister.style.display = "none";
                btnOpenLogin.style.display = "none";
                if (btnLogout) {
                    btnLogout.style.display = "inline-block";
                }
            } else {
                Swal.fire("Error", "Credenciales incorrectas. Verifique los datos.", "error");
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