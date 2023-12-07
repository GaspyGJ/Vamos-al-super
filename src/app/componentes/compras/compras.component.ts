import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Compra } from 'src/app/clases/compra';
import { CompraService } from 'src/app/servicios/compra.service';
import { LoginService } from 'src/app/servicios/login.service';

@Component({
  selector: 'app-compras',
  templateUrl: './compras.component.html',
  styleUrls: ['./compras.component.css'],
})
export class ComprasComponent implements OnInit {
  loader: boolean = true;
  listCompras: Compra[] = [];

  constructor(
    private router: Router,
    private comprasService: CompraService,
    private loginService: LoginService
  ) { }

  ngOnInit(): void {
    window.addEventListener('beforeunload', this.salirByBrowser);

    const user_id = this.loginService.getUsuario().id;
    //Busco la lista de productos del usuario, si no tiene una, busco la general
    const listaComrpas = this.comprasService.getComprasByUserLocal();
    if (listaComrpas != null) {
      this.listCompras = listaComrpas;
      this.loader = false;
    } else {
      this.comprasService.getComprasByUser(user_id).subscribe({
        next: (list) => {
          this.listCompras = list;
          this.comprasService.setComprasByUserLocal(list);
          this.loader = false;
        },
        error: (err) => {
          console.error(err);
          alert(err.error.message || err.message);
        },
        complete: () => {
          console.log("Complete get compras by user");
        }
      });
    }
  }

  salirByBrowser(e: any) {
    e.preventDefault();
    this.comprasService.removerComprasByUserLocal();
  }

  salir() {
    this.comprasService.removerComprasByUserLocal();
    this.router.navigate(['lista']);
  }

  //Se utiliza en el HTML
  public ordenarListaByFecha(fecha: string) {
    this.listCompras.sort((a) => {
      if (a.fecha.toLowerCase().includes(fecha.toLowerCase())) {
        return -1;
      } else {
        return 1;
      }
    });
  }

  formatearFecha(fechaOriginal: string): string {
    const fecha = new Date(fechaOriginal);

    // Obtener los componentes de la fecha
    const dia = fecha.getUTCDate();
    const mes = fecha.getUTCMonth() + 1; // Meses en JavaScript son de 0 a 11
    const anio = fecha.getUTCFullYear();
    const hora = fecha.getUTCHours();
    const minutos = fecha.getUTCMinutes();

    // Formatear la fecha y hora como "DD/MM/YYYY HH:mm"
    const fechaFormateada = `${dia.toString().padStart(2, '0')}/${mes
      .toString()
      .padStart(2, '0')}/${anio} a las ${hora
        .toString()
        .padStart(2, '0')}:${minutos.toString().padStart(2, '0')} hs`;

    return fechaFormateada; // 01/12/2023 03:00
  }

  public selectCompra(compra: Compra) {
    this.comprasService.setCompraSeleccionadaLocal(compra);
    this.router.navigate(['compra']);
  }
}
