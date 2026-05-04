import { LocalStorageService } from "./storage.js";
import { Usuario } from "./models/Usuario.js";

export const AuthService = {
    registrar(email, pass) {
        // Validación básica de email
        if (!email.includes("@") || !email.includes(".")) return "Email inválido";
        if (pass.length < 4) return "Contraseña débil (mínimo 4 caracteres)";

        const users = LocalStorageService.obtener("users") || [];

        if (users.some(u => u.email === email)) {
            return "El usuario ya existe";
        }

        // Cifrado básico de la contraseña usando btoa
        const passCifrada = btoa(pass);

        const nuevoUsuario = new Usuario(email, passCifrada);
        users.push(nuevoUsuario);
        
        LocalStorageService.guardar("users", users);
        return "ok";
    },

    login(email, pass) {
        if (!email || !pass) return "Completar campos";

        const users = LocalStorageService.obtener("users") || [];
        
        // Buscamos el usuario por su email
        const userFound = users.find(u => u.email === email);

        if (!userFound) return "Error login";

        // Desencriptamos para comparar con la contraseña ingresada
        const passDesencriptada = atob(userFound.pass);
        if (passDesencriptada !== pass) {
            return "Error login";
        }

        LocalStorageService.guardar("usuario", email);
        return "ok";
    },

    logout() {
        LocalStorageService.guardar("usuario", null);
    }
};