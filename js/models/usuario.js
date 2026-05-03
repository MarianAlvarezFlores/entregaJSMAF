export class Usuario {
    constructor(user, pass) {
        this.user = user;
        this.pass = pass;
    }

    validarCredenciales(inputUser, inputPass) {
        return this.user === inputUser && this.pass === inputPass;
    }
}