export const LocalStorageService = {
    guardar(key, data) {
        try {
            localStorage.setItem(key, JSON.stringify(data));
        } catch (error) {
            // Eliminamos el console.error para cumplir con la consigna de limpieza total
        }
    },

    obtener(key) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            // Eliminamos el console.error y retornamos null para que la app siga funcionando
            return null;
        }
    }
};