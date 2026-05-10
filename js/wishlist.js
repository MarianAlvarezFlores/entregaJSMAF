export const WishlistService = {
    obtener() {
        return JSON.parse(localStorage.getItem("wishlist")) || [];
    },
    toggle(id) {
        let favs = this.obtener();
        const index = favs.indexOf(id);
        if (index > -1) {
            favs.splice(index, 1);
            localStorage.setItem("wishlist", JSON.stringify(favs));
            return { mensaje: "Eliminado de favoritos", icon: "🤍" };
        } else {
            favs.push(id);
            localStorage.setItem("wishlist", JSON.stringify(favs));
            return { mensaje: "Agregado a favoritos", icon: "❤️" };
        }
    }
};