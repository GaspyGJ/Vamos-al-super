import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Compra } from 'src/app/clases/compra';
import { CompraService } from 'src/app/servicios/compra.service';

@Component({
  selector: 'app-compra',
  templateUrl: './compra.component.html',
  styleUrls: ['./compra.component.css']
})
export class CompraComponent implements OnInit{

  compra: Compra;
  constructor(private compraService:CompraService, private router:Router){
    this.compra = this.compraService.getCompraSeleccionadaLocal();
  }

  ngOnInit(): void {
    window.addEventListener('beforeunload', this.salirByBrowser); 
  }

  salirByBrowser(e:any){
    e.preventDefault(); 
    this.compraService.removerCompraSeleccionadaLocal();
  }

  salir(){
    this.compraService.removerCompraSeleccionadaLocal();
    this.router.navigate(["compras"])
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
}
