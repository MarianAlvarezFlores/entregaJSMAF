export const LocalStorageService = {
    guardar(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            console.error("Error al guardar en localStorage:", error);
        }
    },

    obtener(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error("Error al obtener datos de localStorage:", error);
            return null;
        }
    }
};