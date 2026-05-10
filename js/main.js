import { obtenerProductos } from "./products.js";
import { AuthService } from "./auth.js";
import { Carrito } from "./cart.js";
import { renderProductos, renderCarrito, mostrarToast } from "./ui.js";
import { LocalStorageService } from "./storage.js";
import { SearchService } from "./search.js";
import { WishlistService } from "./wishlist.js";

const miCarrito = new Carrito();
let listaProductos = [];

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
        // 1. CAPTURAMOS EL INPUT DEL BUSCADOR
        const inputBusqueda = document.getElementById("input-busqueda");

        listaProductos = await obtenerProductos();

        if (listaProductos.length === 0) {
            mostrarToast("No hay productos disponibles en el catálogo.");
            return;
        }

        const agregarAlCarrito = (id, talle) => {
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

                Toast.fire({ icon: 'success', title: 'Producto agregado al carrito' });

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
// --- FUNCIÓN PARA MOSTRAR/OCULTAR LA SECCIÓN VIP ---
const actualizarVistaWishlist = () => {
    const seccionWishlist = document.getElementById("seccion-wishlist");
    const contenedorWishlist = document.getElementById("contenedor-wishlist");
    const usuarioLogueado = LocalStorageService.obtener("usuario");

    if (usuarioLogueado && seccionWishlist) {
        seccionWishlist.classList.remove("hidden");
        const idsFavs = WishlistService.obtener();
        const productosFavs = listaProductos.filter(p => idsFavs.includes(p.id));

        if (productosFavs.length > 0) {
            renderProductos(contenedorWishlist, productosFavs, agregarAlCarrito, manejarWishlist);
        } else {
            contenedorWishlist.innerHTML = "<p class='texto-vacio'>No tienes favoritos guardados aún.</p>";
        }
    } else if (seccionWishlist) {
        seccionWishlist.classList.add("hidden");
    }
};

// --- FUNCIÓN MANEJAR WISHLIST CON SWEET ALERT ---
    const manejarWishlist = (id) => {
        const usuarioLogueado = LocalStorageService.obtener("usuario");

        // 1. SI NO ESTÁ LOGUEADO: Alerta restrictiva
        if (!usuarioLogueado) {
            Swal.fire({
                title: 'ACCESO EXCLUSIVO',
                text: 'Debes iniciar sesión para crear tu propia lista de deseos.',
                icon: 'info',
                showCancelButton: true,
                confirmButtonColor: '#D4AF37',
                cancelButtonColor: '#000',
                confirmButtonText: 'INICIAR SESIÓN',
                cancelButtonText: 'LUEGO'
            }).then((result) => {
                if (result.isConfirmed) {
                    document.getElementById("btn-open-login").click();
                }
            });
            return; 
        }

        // 2. SI ESTÁ LOGUEADO: Ejecutar toggle
        const resultado = WishlistService.toggle(id);
        
        Swal.fire({
            toast: true,
            position: 'bottom-end',
            showConfirmButton: false,
            timer: 2000,
            icon: 'success',
            title: resultado.mensaje,
            background: document.body.classList.contains('dark-mode') ? '#333' : '#fff',
            color: document.body.classList.contains('dark-mode') ? '#fff' : '#000'
        });

        // 3. ACTUALIZACIÓN VISUAL
        // Volvemos a renderizar el catálogo para que cambie el corazón 🤍 -> ❤️
        const filtrados = listaProductos.filter(p => /* tu lógica de búsqueda actual */ true);
        renderProductos(document.getElementById("contenedor-productos"), filtrados, agregarAlCarrito, manejarWishlist);
        
        // Actualizamos la sección de arriba
        actualizarVistaWishlist;
    };
        // --- RENDERIZADO INICIAL ---
        if (contenedorProductos) {
            renderProductos(contenedorProductos, listaProductos, agregarAlCarrito, manejarWishlist);
        }

        // --- 2. LÓGICA DEL BUSCADOR POR PALABRA ---
        if (inputBusqueda) {
            inputBusqueda.addEventListener("input", (e) => {
                const termino = e.target.value.toLowerCase().trim();
                
                // Filtramos la lista original por el nombre o la categoría
                const filtrados = listaProductos.filter(p => 
                    p.nombre.toLowerCase().includes(termino) || 
                    p.categoria.toLowerCase().includes(termino)
                );

                // Volvemos a renderizar con los resultados del filtro
                renderProductos(contenedorProductos, filtrados, agregarAlCarrito, manejarWishlist);
            });
        }

        // Lógica de los filtros (Botones)
        const btnTodos = document.getElementById("btn-todos");
        const btnArriba = document.getElementById("btn-arriba");
        const btnAbajo = document.getElementById("btn-abajo");
        const btnVestidos = document.getElementById("btn-vestidos");

        const aplicarFiltro = (categoria) => {
            if (!contenedorProductos) return;
            
            // Limpiamos el buscador visualmente al tocar un botón de categoría
            if (inputBusqueda) inputBusqueda.value = "";

            if (categoria === "todos") {
                renderProductos(contenedorProductos, listaProductos, agregarAlCarrito, manejarWishlist);
            } else {
                const filtrados = listaProductos.filter(p => p.categoria.toLowerCase() === categoria.toLowerCase());
                renderProductos(contenedorProductos, filtrados, agregarAlCarrito, manejarWishlist);
            }
        };

        if (btnTodos) btnTodos.addEventListener("click", () => aplicarFiltro("todos"));
        if (btnArriba) btnArriba.addEventListener("click", () => aplicarFiltro("partes de arriba"));
        if (btnAbajo) btnAbajo.addEventListener("click", () => aplicarFiltro("partes de abajo"));
        if (btnVestidos) btnVestidos.addEventListener("click", () => aplicarFiltro("vestidos"));

    } catch (error) {
        console.error("Error en main.js:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error de Carga',
            text: 'No pudimos sincronizar el catálogo de productos.',
            confirmButtonColor: '#D4AF37'
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
                actualizarVistaWishlist();
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

        // --- LIMPIEZA DE CARRITO ---
        const carritoItems = document.getElementById("carrito-items");
        if (carritoItems) {
            carritoItems.innerHTML = "<p>El carrito está vacío.</p>";
        }
        const total = document.getElementById("total");
        if (total) {
            total.textContent = "$0";
        }

        // --- CAMBIOS PARA LA WISHLIST (NUEVO) ---
        
        // 1. Ocultamos la sección VIP de favoritos
        actualizarVistaWishlist(); 

        // 2. Refrescamos el catálogo principal
        // Esto es clave: al no haber usuario, los corazones vuelven a 🤍
        renderProductos(
            document.getElementById("contenedor-productos"), 
            listaProductos, 
            agregarAlCarrito, 
            manejarWishlist
        );
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