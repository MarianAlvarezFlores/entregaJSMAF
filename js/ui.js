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
                    <option value="" disabled selected>Elegir talle...</option>
                    ${p.variantes.map(v => `<option value="${v.talle}">Talle ${v.talle} (${v.stock} disp.)</option>`).join("")}
                </select>
            </div>
            <button class="btn-principal btn-add">Agregar al carrito</button>
        `;

        const boton = card.querySelector(".btn-add");
        boton.addEventListener("click", () => {
            const selectTalle = card.querySelector(`#talle-${p.id}`);
            onAdd(p.id, selectTalle.value); // Nota: Llama a onAdd, que es la función que pasamos
            onAdd(p.id, selectTalle.value);
        });
        
        const Add = (id, talle) => {
            onAdd(id, talle);
        };

        container.appendChild(card);
    });
}

export function renderCarrito(container, carritoItems, total, onRemove) {
    container.innerHTML = "";

    if (carritoItems.length === 0) {
        const pEmpty = document.createElement("p");
        pEmpty.textContent = "El carrito está vacío.";
        container.appendChild(pEmpty);
        
        // Limpiamos el total cuando el carrito se vacía
        const totalEl = document.getElementById("total");
        if (totalEl) {
            totalEl.textContent = "$0";
        }
        return;
    }

    carritoItems.forEach(item => {
        const li = document.createElement("li");
        li.style.display = "flex";
        li.style.justifyContent = "space-between";
        li.style.alignItems = "center";
        li.style.marginBottom = "0.75rem";
        li.style.padding = "0.5rem";
        li.style.borderBottom = "1px solid var(--border-color, #eee)";

        // Botón sin la cruz, usando la clase del botón principal
        li.innerHTML = `
            <span>${item.nombre} (Talle: ${item.talle}) x${item.cantidad} - $${item.precio * item.cantidad}</span>
            <button class="btn-principal btn-eliminar-item" style="padding: 0.3rem 0.6rem; font-size: 0.85rem; cursor: pointer;">
                Eliminar
            </button>
        `;

        const btnEliminar = li.querySelector(".btn-eliminar-item");
        btnEliminar.addEventListener("click", () => {
            onRemove(item.id, item.talle);
        });

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