export function renderProductos(container, productos, onAdd) {
    container.innerHTML = "";

    productos.forEach(p => {
        const card = document.createElement("div");
        card.className = "card";

        card.innerHTML = `
            <img src="${p.img}" alt="${p.nombre}" />
            <h3>${p.nombre}</h3>
            <p class="categoria-card">Categoría: ${p.categoria}</p>
            <p>Precio: $${p.precio}</p>
            <div class="selector-variante">
                <label for="talle-${p.id}"><strong>Elegir Talle:</strong></label>
                <select id="talle-${p.id}" class="form-select">
                    ${p.variantes.map(v => `<option value="${v.talle}">Talle ${v.talle} (${v.stock} disp.)</option>`).join("")}
                </select>
            </div>
            <button class="btn-principal btn-add">Agregar al carrito</button>
        `;

        const boton = card.querySelector(".btn-add");
        boton.addEventListener("click", () => {
            const selectTalle = card.querySelector(`#talle-${p.id}`);
            onAdd(p.id, selectTalle.value);
        });

        container.appendChild(card);
    });
}

export function renderCarrito(container, carritoItems, total) {
    container.innerHTML = "";

    if (carritoItems.length === 0) {
        const pEmpty = document.createElement("p");
        pEmpty.textContent = "El carrito está vacío.";
        container.appendChild(pEmpty);
        return;
    }

    carritoItems.forEach(item => {
        const li = document.createElement("li");
        li.textContent = `${item.nombre} (Talle: ${item.talle}) x${item.cantidad} - $${item.precio * item.cantidad}`;
        container.appendChild(li);
    });

    const totalEl = document.getElementById("total");
    if (totalEl) {
        totalEl.textContent = `$${total}`;
    }
}

export function mostrarToast(mensaje) {
    Toastify({
        text: mensaje,
        duration: 3000,
        gravity: "bottom",
        position: "right",
        style: {
            background: "linear-gradient(to right, #00b09b, #96c93d)",
        }
    }).showToast();
}