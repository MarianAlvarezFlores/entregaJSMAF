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
                        ${esFav ? '❤️' : '🤍'}
                    </button>
                </div>
                <img src="${p.img}" alt="${p.nombre}" class="img-producto" />
                <h3>${p.nombre}</h3>
                <p class="precio">$${p.precio}</p>
                <div class="selector-talle">
                    <select id="talle-${p.id}" class="select-talle">
                        <option value="" disabled selected>Elegir talle...</option>
                        ${p.variantes.map(v => `<option value="${v.talle}">${v.talle}</option>`).join("")}
                    </select>
                </div>
                <button class="btn-agregar btn-principal">AÑADIR AL CARRITO</button>
            `;

            // Evento para el corazón
            card.querySelector(".btn-wish").addEventListener("click", () => onWish(p.id));

            // Evento para el carrito
            card.querySelector(".btn-agregar").addEventListener("click", () => {
                const selectTalle = card.querySelector(`#talle-${p.id}`);
                onAdd(p.id, selectTalle.value);
            });

            container.appendChild(card);
        });
    }

export function renderCarrito(container, carritoItems, total, onRemove) {
    container.innerHTML = "";

    const totalEl = document.getElementById("total");

    if (carritoItems.length === 0) {
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
        li.className = "item-carrito"; // Mejor usar clases que estilos inline para el CSS

        li.innerHTML = `
            <span>${item.nombre} (Talle: ${item.talle}) x${item.cantidad} - $${item.precio * item.cantidad}</span>
            <button class="btn-principal btn-eliminar-item">
                Eliminar
            </button>
        `;

        const btnEliminar = li.querySelector(".btn-eliminar-item");
        btnEliminar.addEventListener("click", () => {
            onRemove(item.id, item.talle);
        });

        container.appendChild(li);
    });

    if (totalEl) {
        totalEl.textContent = `$${total}`;
    }
}

export function mostrarToast(mensaje) {
    // Usamos Toastify según tu código
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
            background: "linear-gradient(to right, #D4AF37, #000000)", // Cambié los colores para que peguen con tu estética dorada
        }
    }).showToast();
}