export class Usuario {
    constructor(email, pass) {
        this.email = email;
        this.pass = pass;
    }

    validarCredenciales(inputEmail, inputPass) {
        return this.email === inputEmail && this.pass === inputPass;
    }
}