import { LocalStorageService } from "./storage.js";

export const WishlistService = {
    // Función interna para obtener la clave única del usuario actual
    _getClave() {
        const usuario = LocalStorageService.obtener("usuario");
        // Si no hay usuario, devolvemos una clave genérica o null
        return usuario ? `wishlist_${usuario.email}` : null;
    },

    obtener() {
        const clave = this._getClave();
        if (!clave) return []; // Si no hay usuario, la lista siempre es vacía
        return JSON.parse(localStorage.getItem(clave)) || [];
    },

    toggle(id) {
        const clave = this._getClave();
        if (!clave) return { mensaje: "Debes iniciar sesión", icon: "info" };

        let favs = this.obtener();
        const index = favs.indexOf(id);

        if (index > -1) {
            favs.splice(index, 1);
            localStorage.setItem(clave, JSON.stringify(favs));
            return { mensaje: "Eliminado de favoritos", icon: "🤍" };
        } else {
            favs.push(id);
            localStorage.setItem(clave, JSON.stringify(favs));
            return { mensaje: "Agregado a favoritos", icon: "❤️" };
        }
    }
};