import { WishlistService } from "./wishlist.js";
export function renderProductos(container, productos, onAdd, onWish) {
    container.innerHTML = "";

    productos.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

// Verificamos si el producto ya está en favoritos
        const esFav = WishlistService.obtener().includes(p.id);

        card.innerHTML = `
            <div class="wishlist-container" style="text-align: right; margin-bottom: -30px; position: relative; z-index: 10;">
                <button class="btn-wish" data-id="${p.id}" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; transition: transform 0.2s;">
                    ${esFav ? '❤️' : '🤍'}
                </button>
            </div>
            <img src="${p.img}" alt="${p.nombre}" />
            <h3>${p.nombre}</h3>
            <p class="categoria-card">Categoría: ${p.categoria}</p>
            <p>Precio: $${p.precio}</p>
            <div class="selector-variante">
                <label for="talle-${p.id}"><strong>Elegir Talle:</strong></label>
                <select id="talle-${p.id}" class="form-select">
                    <option value="" disabled selected>Elegir talle...</option>
                    ${p.variantes.map(v => `<option value="${v.talle}">Talle ${v.talle} (${v.stock} disp.)</option>`).join("")}
                </select>
            </div>
            <button class="btn-principal btn-add">Agregar al carrito</button>
        `;

        // Lógica del botón de favoritos
        const btnWish = card.querySelector(".btn-wish");
        btnWish.addEventListener("click", () => {
            onWish(p.id);
        });

        // Lógica del botón de carrito
        const boton = card.querySelector(".btn-add");
        boton.addEventListener("click", () => {
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