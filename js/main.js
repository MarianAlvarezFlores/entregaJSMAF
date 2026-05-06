import { obtenerProductos } from "./products.js";
import { AuthService } from "./auth.js";
import { Carrito } from "./cart.js";
import { renderProductos, renderCarrito, mostrarToast } from "./ui.js";
import { LocalStorageService } from "./storage.js";

const miCarrito = new Carrito();
let listaProductos = [];

// Función para eliminar un producto del carrito desde la vista
const eliminarDelCarrito = (id, talle) => {
    miCarrito.eliminarProducto(id, talle, listaProductos);

    renderCarrito(
        document.getElementById("carrito-items"),
        miCarrito.getItems(),
        miCarrito.calcularTotal(),
        eliminarDelCarrito
    );
};

document.addEventListener("DOMContentLoaded", async () => {
    try {
        const contenedorProductos = document.getElementById("contenedor-productos");
        
        // Intentamos obtener los productos
        listaProductos = await obtenerProductos();

        if (listaProductos.length === 0) {
            mostrarToast("No hay productos disponibles en el catálogo.");
            return;
        }

        const agregarAlCarrito = (id, talle) => {
            // Validación: Verificar que se haya seleccionado un talle válido
            if (!talle || talle === "" || talle === "undefined") {
                Swal.fire({
                    icon: 'warning',
                    title: 'Falta seleccionar talle',
                    text: 'Por favor, elige un talle antes de agregar el producto al carrito.',
                    confirmButtonColor: '#D4AF37'
                });
                return;
            }

            const agregado = miCarrito.agregar(id, listaProductos, talle);
            
            if (agregado) {
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 2500,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });

                Toast.fire({
                    icon: 'success',
                    title: 'Producto agregado al carrito'
                });

                renderCarrito(
                    document.getElementById("carrito-items"), 
                    miCarrito.getItems(), 
                    miCarrito.calcularTotal(),
                    eliminarDelCarrito
                );
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'No hay suficiente stock para la variante seleccionada.',
                    confirmButtonColor: '#D4AF37'
                });
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
        
        Swal.fire({
            icon: 'error',
            title: 'Error de Carga',
            text: 'No pudimos sincronizar el catálogo de productos. Por favor, intenta recargar la página.',
            confirmButtonColor: '#D4AF37',
            background: document.body.classList.contains('dark-mode') ? '#1a1a1a' : '#fff',
            color: document.body.classList.contains('dark-mode') ? '#fff' : '#000'
        });
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

        const Toast = Swal.mixin({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            timerProgressBar: true,
            didOpen: (toast) => {
                toast.addEventListener('mouseenter', Swal.stopTimer);
                toast.addEventListener('mouseleave', Swal.resumeTimer);
            }
        });

        Toast.fire({
            icon: 'success',
            title: 'Sesión cerrada'
        });
        
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
            Swal.fire({
                icon: 'warning',
                title: 'Acción necesaria',
                text: 'Debes iniciar sesión para finalizar la compra.',
                confirmButtonColor: '#D4AF37'
            });
            return;
        }

        Swal.fire({
            title: 'Procesando tu pedido',
            text: 'Por favor, espera unos instantes...',
            allowOutsideClick: false,
            didOpen: () => {
                Swal.showLoading();
            }
        });

        try {
            const resultado = await miCarrito.finalizarCompra(listaProductos);
            Swal.fire({
                icon: 'success',
                title: '¡Compra completada!',
                text: resultado.mensaje,
                confirmButtonColor: '#D4AF37'
            });
            renderCarrito(
                document.getElementById("carrito-items"), 
                miCarrito.getItems(), 
                miCarrito.calcularTotal(),
                eliminarDelCarrito
            );
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Error en la compra',
                text: error,
                confirmButtonColor: '#D4AF37'
            });
        }
    });
}

// Vaciar carrito
const btnVaciar = document.getElementById("btn-vaciar");
if (btnVaciar) {
    btnVaciar.addEventListener("click", () => {
        if (miCarrito.getItems().length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'Carrito vacío',
                text: 'No hay productos en el carrito para vaciar.',
                confirmButtonColor: '#D4AF37'
            });
            return;
        }

        Swal.fire({
            title: '¿Estás seguro?',
            text: "No podrás revertir esta acción.",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#D4AF37',
            cancelButtonColor: '#717171',
            confirmButtonText: 'Sí, vaciar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                // CAMBIO CLAVE: Usamos .clear() que actualiza datos y LocalStorage
                miCarrito.clear(); 
                
                const Toast = Swal.mixin({
                    toast: true,
                    position: 'bottom-end',
                    showConfirmButton: false,
                    timer: 2000,
                    timerProgressBar: true,
                    didOpen: (toast) => {
                        toast.addEventListener('mouseenter', Swal.stopTimer);
                        toast.addEventListener('mouseleave', Swal.resumeTimer);
                    }
                });

                Toast.fire({
                    icon: 'success',
                    title: 'El carrito se ha vaciado'
                });

                // ACTUALIZACIÓN DEL DOM: Repintamos con el carrito ya vacío
                renderCarrito(
                    document.getElementById("carrito-items"), 
                    miCarrito.getItems(), // Esto ahora devolverá []
                    miCarrito.calcularTotal(), // Esto ahora devolverá 0
                    eliminarDelCarrito
                );
            }
        });
    });
}