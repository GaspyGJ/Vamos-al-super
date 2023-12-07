import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from "../../environments/environment"
import { Router } from '@angular/router';
import { Observable, catchError, of } from 'rxjs';


@Injectable({
  providedIn: 'root'
})
export class ProductoService {

  token: string;
  httpOptions: Object;
  API_URL = environment.API_URL + "/productos";

  constructor(private httpClient: HttpClient, private router: Router) {
    this.token = this.getToken();
    this.httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        'authorization': this.token,
      }),
    };
  }

  //LOCAL
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
  guardarListaSeleccionados(lista: Array<any>) {
    const listaString = JSON.stringify(lista);
    localStorage.setItem("lista_seleccionados", listaString);
  }
  getSeleccionados() {
    const lista = localStorage.getItem("lista_seleccionados");
    if (lista == null || lista.length == 0) {
      return null;
    }
    const listaParse = JSON.parse(lista!);
    return listaParse
  }
  removeSeleccionados() {
    localStorage.removeItem("lista_seleccionados");
  }


  //BASE DE DATOS
  getList() {
    return this.httpClient
      .get<any>(
        this.API_URL + '/getList',
        this.httpOptions
      ).pipe(
        catchError(this.handleError<any>('getList'))
      );
  }
  guardarProducto(nombre: string) {
    return this.httpClient
      .post<any>(
        this.API_URL + '/new',
        { nombre },
        this.httpOptions
      ).pipe(
        catchError(this.handleError<any>('new'))
      );
  }
  obtenerOrCrear(nombre: string) {
    return this.httpClient
      .post<any>(
        this.API_URL + '/getOrCreate',
        { nombre },
        this.httpOptions
      ).pipe(
        catchError(this.handleError<any>('getOrCreate'))
      );
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
