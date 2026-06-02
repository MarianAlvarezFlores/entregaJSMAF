import { WishlistService } from "./wishlist.js";

export function renderProductos(container, productos, onAdd, onWish) {
    if (!container) return;
    container.innerHTML = "";

    const favoritos = WishlistService.obtener();

    productos.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";
        const esFav = favoritos.includes(p.id);

        card.innerHTML = `
            <div class="wishlist-badge">
                <button class="btn-wish" data-id="${p.id}">
                    <i
                        data-lucide="heart"
                        class="icono-favorito ${esFav ? 'activo' : ''}"
                    ></i>
                </button>
            </div>

            <div class="img-card-container">
                <img src="${p.img}" alt="${p.nombre}" class="img-producto" />
            </div>

            <div class="card-body">

                <div class="card-info">

                    <h3>${p.nombre}</h3>

                    <p class="precio">
                        $${p.precio.toLocaleString()}
                    </p>

                </div>

                <div class="card-actions">

                    <div class="selector-talle">

                        <select id="talle-${p.id}" class="select-talle">
                            <option value="" disabled selected>
                                Elegir talle...
                            </option>

                            ${p.variantes.map(v => `
                                <option value="${v.talle}">
                                    ${v.talle}
                                </option>
                            `).join("")}
                        </select>

                    </div>

                    <button class="btn-agregar btn-principal">
                        Añadir al carrito
                    </button>

                </div>

            </div>
        `;

        // Evento para favoritos
        card.querySelector(".btn-wish").addEventListener("click", () => {
            onWish(p.id);
        });

        // Evento para carrito
        card.querySelector(".btn-agregar").addEventListener("click", () => {
            const selectTalle = card.querySelector(`#talle-${p.id}`);
            onAdd(p.id, selectTalle.value);
        });

        container.appendChild(card);
    });
    lucide.createIcons();
}

export function renderCarrito(
    container,
    carritoItems,
    total,
    onRemove,
    onPlus,
    onMinus
) {
    container.innerHTML = "";

    const totalEl = document.getElementById("total");
    const cantidadItems = document.getElementById("cantidad-items");

    // Actualizar cantidad de productos
    if (cantidadItems) {
        const totalProductos = carritoItems.reduce(
            (total, item) => total + item.cantidad,
            0
        );

        cantidadItems.textContent =
            `${totalProductos} ITEM${totalProductos !== 1 ? "S" : ""}`;
    }

    // Carrito vacío
    if (carritoItems.length === 0) {

        if (cantidadItems) {
            cantidadItems.textContent = "0 ITEMS";
        }

        const pEmpty = document.createElement("p");
        pEmpty.textContent = "El carrito está vacío.";
        container.appendChild(pEmpty);

        if (totalEl) {
            totalEl.textContent = "$0";
        }

        return;
    }

    carritoItems.forEach(item => {
        const li = document.createElement("li");
        li.className = "item-carrito";

        li.innerHTML = `
            <span>
                ${item.nombre} (Talle: ${item.talle})
            </span>

            <div class="controles-cantidad">
                <button class="btn-menos">
                    <i data-lucide="minus"></i>
                </button>

                <span>${item.cantidad}</span>

                <button class="btn-mas">
                    <i data-lucide="plus"></i>
                </button>
            </div>

            <span>
                $${(item.precio * item.cantidad).toLocaleString()}
            </span>

            <button class="btn-principal btn-eliminar-item">
                Eliminar
            </button>
        `;

        const btnEliminar = li.querySelector(".btn-eliminar-item");
        const btnMas = li.querySelector(".btn-mas");
        const btnMenos = li.querySelector(".btn-menos");

        btnEliminar.addEventListener("click", () => {
            onRemove(item.id, item.talle);
        });

        btnMas.addEventListener("click", () => {
            onPlus(item.id, item.talle);
        });

        btnMenos.addEventListener("click", () => {
            onMinus(item.id, item.talle);
        });

        container.appendChild(li);
        if (window.lucide) {
            lucide.createIcons();
        }
    });

    if (totalEl) {
        totalEl.textContent = `$${total.toLocaleString()}`;
    }
}

export function mostrarToast(mensaje) {

    Toastify({

        text: mensaje,

        duration: 2500,

        gravity: "bottom",

        position: "right",

        stopOnFocus: true,

        style: {
            background: "#121212",
            color: "#ffffff",
            border: "1px solid #d8d1c7",
            boxShadow: "0 10px 25px rgba(0,0,0,0.15)"
        }

    }).showToast();
}