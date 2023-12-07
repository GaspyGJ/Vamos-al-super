import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { environment } from 'src/environments/environment';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoginService {
  constructor(
    private httpClient: HttpClient,
    private router: Router,
    private toastr: ToastrService
  ) { }

  API_URL = environment.API_URL + "/auth";

  httpOptions = {
    headers: new HttpHeaders({
      'Access-Control-Allow-Origin': '*',
    }),
  };

  //LOCAL
  usuarioEsAnonimo() {
    return this.getUsuario().email == 'anonimo@anonimo.anonimo' ? true : false;
  }
  getUsuario() {
    const user = localStorage.getItem('usuario');
    if (!user) {
      this.router.navigate(['']);
    }
    const parseUser = JSON.parse(user!);
    if (!parseUser.token || parseUser.token == '') {
      this.router.navigate(['']);
    }
    return parseUser.usuario;
  }
  getToken() {
    const user = localStorage.getItem('usuario');
    if (!user) {
      this.router.navigate(['']);
    }
    const parseUser = JSON.parse(user!);
    if (!parseUser.token) {
      this.router.navigate(['']);
    }
    return parseUser.token;
  }
  saveUser(user: any) {
    localStorage.setItem('usuario', JSON.stringify(user));
  }
  deleteUser() {
    localStorage.removeItem('usuario');
  }
  logout() {
    this.deleteUser();
    this.router.navigate(['']);
  }

  //BASE DE DATOS
  loginAnonimo() {
    return this.loginEmailPassword('anonimo@anonimo.anonimo', 'anonimo');
  }

  registerEmailPassword(nombre: string, email: string, contrasenia: string) {
    if (
      nombre.trim().length == 0 ||
      email.trim().length == 0 ||
      contrasenia.trim().length == 0
    ) {
      this.toastr.error('No se permiten campos vacios');
      return;
    }
    contrasenia = contrasenia.trim();
    email = email.trim();
    nombre = nombre.trim();
    this.httpClient
      .post<any>(
        this.API_URL + '/register',
        { nombre, email, contrasenia, proveedor: 'EMAIL_PASSWORD' },
        this.httpOptions
      ).pipe(
        catchError(this.handleError<any>('registerEmailPassword'))
      )
      .subscribe({
        next: (user) => {
          this.saveUser(user);
          this.toastr.success('Registrado correctamente');
          this.router.navigate(['lista']);
        },
        error: (err) => {
          if (!err.error.message) {
            this.toastr.error('No pudo registrarse');
          }
          else {
            this.toastr.error(err.error.message);
          }
        },
        complete: () => {
          console.log("Complete register with email");
        }
      });
  }

  registerGoogle(nombre: string, email: string, contrasenia: string) {
    if (
      nombre.trim().length == 0 ||
      email.trim().length == 0 ||
      contrasenia.trim().length == 0
    ) {
      this.toastr.error('No se permiten campos vacios');
      return;
    }

    contrasenia = contrasenia.trim();
    email = email.trim();
    nombre = nombre.trim();

    this.httpClient
      .post<any>(this.API_URL + '/register', {
        nombre,
        email,
        contrasenia,
        proveedor: 'GOOGLE',
      }).pipe(
        catchError(this.handleError<any>('registerGoogle'))
      )
      .subscribe({
        next: (user) => {
          this.saveUser(user);
          this.toastr.success('Registrado correctamente');
          this.router.navigate(['lista']);
        },
        error: (err) => {
          console.error(err);
          this.toastr.error('No pudo registrarse');
        },
        complete: () => {
          console.log("Complete register with google");
        }
      });
  }

  loginEmailPassword(email: string, contrasenia: string) {
    if (email.trim().length == 0 || contrasenia.trim().length == 0) {
      this.toastr.error('No se permiten campos vacios');
      return;
    }

    contrasenia = contrasenia.trim();
    email = email.trim();

    this.httpClient
      .post<any>(this.API_URL + '/login', {
        email,
        contrasenia,
        proveedor: 'EMAIL_PASSWORD',
      }).pipe(
        catchError(this.handleError<any>('loginEmailPassword'))
      )
      .subscribe({
        next: (user) => {
          this.saveUser(user);
          this.router.navigate(['lista']);
        },
        error: (err) => {
          console.error(err);
          if (!err.error.message) {
            this.toastr.error("Error al iniciar sesión");
          } else {
            this.toastr.error(err.error.message);
          }
        },
        complete: () => {
          console.log("Complete login with email");
        }
      });
  }

  loginGoogle(nombre: string, email: string) {
    if (nombre.trim().length == 0 || email.trim().length == 0) {
      this.toastr.error('No se permiten campos vacios');
      return;
    }

    email = email.trim();
    nombre = nombre.trim();

    this.httpClient
      .post<any>(this.API_URL + '/login', {
        nombre,
        email,
        proveedor: 'GOOGLE',
      }).pipe(
        catchError(this.handleError<any>('loginGoogle'))
      )
      .subscribe({
        next: (user) => {
          this.saveUser(user);
          this.router.navigate(['lista']);
        },
        error: (err) => {
          if (err.error.message == 'Email no encontrado' || err.message == 'Email no encontrado') {
            //guardo su email como contrasenia.

            this.registerGoogle(nombre, email, email);
          } else {
            this.toastr.error(err.error.message);
          }
        },
        complete: () => {
          console.log("Complete login with google");
        }
      });
  }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error("operation= " + operation);
      console.error(error); // Loguea el error en la consola
      // Devuelve un resultado seguro para que la aplicación pueda seguir funcionando
      return of(result as T);
    };
  }

}
