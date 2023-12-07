import { Injectable } from '@angular/core';
import { ProductoService } from './producto.service';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Compra } from '../clases/compra';
import { Observable, catchError, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CompraService {
  token: string;
  httpOptions: Object;
  API_URL = environment.API_URL + '/compras';

  constructor(
    private productosService: ProductoService,
    private router: Router,
    private httpClient: HttpClient
  ) {
    this.token = this.getToken();
    this.httpOptions = {
      headers: new HttpHeaders({
        'Access-Control-Allow-Origin': '*',
        authorization: this.token,
      }),
    };
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

  //*LOCAL*//
  getComprasByUserLocal(): Compra[] | null {
    const compras = localStorage.getItem('compras-by-user');
    if (!compras) {
      return null;
    }
    const parseCompras: Compra[] = JSON.parse(compras!);
    return parseCompras;
  }
  setComprasByUserLocal(compras: Compra[]) {
    localStorage.setItem('compras-by-user', JSON.stringify(compras));
  }
  removerComprasByUserLocal() {
    localStorage.removeItem('compras-by-user');
  }
  setCompraSeleccionadaLocal(compra: Compra) {
    localStorage.setItem('compra-seleccionada', JSON.stringify(compra));
  }
  getCompraSeleccionadaLocal(): Compra {
    const compra = localStorage.getItem('compra-seleccionada');
    const parseCompra = JSON.parse(compra!);
    return parseCompra;
  }
  removerCompraSeleccionadaLocal() {
    localStorage.removeItem('compra-seleccionada');
  }
  setTotalCarrito(valor: number) {
    localStorage.setItem('total_carrito', JSON.stringify(valor));
  }
  getTotalCarrito(): number | null {
    const item = localStorage.getItem('total_carrito');
    if (!item) {
      return null;
    }
    const itemParse = Number(JSON.parse(item!));
    return itemParse;
  }
  setPresupuestoInicial(valor: number) {
    localStorage.setItem('presupuesto_inicial', JSON.stringify(valor));
  }
  getPresupuestoInicial(): number | null {
    const item = localStorage.getItem('presupuesto_inicial');
    if (!item) {
      return null;
    }
    const itemParse = Number(JSON.parse(item!));
    return itemParse;
  }
  existeCompra(): boolean {
    return localStorage.getItem('compra_sin_finalizar') == 'true'
      ? true
      : false;
  }
  setCompraSinFinalizar() {
    localStorage.setItem('compra_sin_finalizar', JSON.stringify(true));
  }
  removerCompra() {
    localStorage.removeItem('compra_sin_finalizar');
    localStorage.removeItem('total_carrito');
    localStorage.removeItem('presupuesto_inicial');
    localStorage.removeItem('compra_sin_finalizar');
    this.productosService.removeSeleccionados();
  }

  //*DATABASE */
  guardarCompra(compra: Compra, usuario_id: number) {
    const fecha = compra.fecha;
    const total = compra.total;
    const presupuestoInicial = compra.presupuesto_inicial;
    const supermercado = compra.supermercado;
    const productos = compra.productos;
    return this.httpClient.post<any>(
      this.API_URL + '/new',
      { fecha, productos, total, presupuestoInicial, supermercado, usuario_id },
      this.httpOptions
    ).pipe(
      catchError(this.handleError<any>('guardarCompra'))
    );
  }
  getComprasByUser(usuario_id: number) {
    return this.httpClient.get<any>(
      this.API_URL + `/byUser/${usuario_id}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError<any>('getComprasByUser'))
    );
  }
  getProductosByCompra(compra_id: number) {
    return this.httpClient.get<any>(
      this.API_URL + `/productosByCompra/${compra_id}`,
      this.httpOptions
    ).pipe(
      catchError(this.handleError<any>('getProductosByCompra'))
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
