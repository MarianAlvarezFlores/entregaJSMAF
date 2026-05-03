import { LocalStorageService } from "./storage.js";
import { Usuario } from "./models/Usuario.js";

export const AuthService = {
    registrar(user, pass) {
        if (user.length < 3) return "Usuario corto";
        if (pass.length < 4) return "Contraseña débil";

        const users = LocalStorageService.obtener("users") || [];

        if (users.some(u => u.user === user)) {
            return "Usuario ya existe";
        }

        const nuevoUsuario = new Usuario(user, pass);
        users.push(nuevoUsuario);
        
        LocalStorageService.guardar("users", users);
        return "ok";
    },

    login(user, pass) {
        if (!user || !pass) return "Completar campos";

        const users = LocalStorageService.obtener("users") || [];
        const userFound = users.find(u => u.user === user && u.pass === pass);

        if (!userFound) return "Error login";

        LocalStorageService.guardar("usuario", user);
        return "ok";
    },

    logout() {
        LocalStorageService.guardar("usuario", null);
    }
};