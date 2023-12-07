//Clases
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
//Servicios
import { ProductoService } from 'src/app/servicios/producto.service';
import { LoginService } from 'src/app/servicios/login.service';
//Mis Clases
import { Estados_productos, Producto } from 'src/app/clases/producto';
import { CompraService } from 'src/app/servicios/compra.service';

@Component({
  selector: 'app-lista',
  templateUrl: './lista.component.html',
  styleUrls: ['./lista.component.css'],
})
export class ListaComponent implements OnInit {
  nombreUsuario: string = '';

  compraSinFinalizar: boolean = false; //Este parametro se utiliza en el HTML para indicar compra faltante de finalizar

  loader: boolean = true;
  listProductos: Producto[] = [];
  listProductosSeleccionados: Producto[] = [];

  //Se utilizan en funciones abajo y en HTML
  SELECCIONADO: string = Estados_productos.SELECCIONADO;
  NO_SELECCIONADO: string = Estados_productos.NO_SELECCIONADO;
  EN_CARRITO: string = Estados_productos.EN_CARRITO;

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private loginService: LoginService,
    private compraService: CompraService
  ) { }

  ngOnInit(): void {
    this.nombreUsuario = this.loginService.getUsuario().nombre;
    if (this.compraService.existeCompra()) {
      this.compraSinFinalizar = true;
    }
    //Busco la lista de productos del usuario, si no tiene una, busco la general
    this.productoService.getList().subscribe({
      next: (list) => {
        this.listProductos = list;
        this.inicializarLista();
        this.loader = false;
      },
      error: (err) => {
        console.error(err);
        alert(err.error.message || err.message);
      },
      complete: () => {
        console.log("Complete get list products");
      }
    });
  }

  public salir() {
    this.loginService.logout();
    this.compraService.removerCompra();
  }

  inicializarLista() {
    //coloco como estado de todo los productos como NO_SELECCIONADO
    this.listProductos.forEach((producto) => {
      producto.estado = Estados_productos.NO_SELECCIONADO;
    });

    //Me fijo si no hay una lista de seleccionados gurdada en local.
    const seleccionados = this.productoService.getSeleccionados();
    if (seleccionados == null) {
      //Si no existe lista retorno
      return;
    }
    //Si existe lista de seleccionados guardada les coloco a los productos de la lista actual el status de la lista (sea seleccionado o en carrito)
    this.listProductosSeleccionados = seleccionados!; // ! --> Se asegura que funcion no retorna NULL

    this.listProductosSeleccionados.forEach((productoS) => {
      const producto_cambiarestado = this.listProductos.find(
        (producto) => producto.nombre === productoS.nombre
      );
      if (producto_cambiarestado) {
        producto_cambiarestado.estado = productoS.estado;
      }
    });
    //la lista vuelve del back ya ordenada alphabeticamente.
  }

  public agregarNuevoProducto(): void {
    //Funcionalidad no permitida con usuario Anonimo.
    if (this.loginService.usuarioEsAnonimo()) {
      Swal.fire({
        title: `No permitido.`,
        text: 'Regístrese para utilizar esta función.',
        confirmButtonText: 'Registrarse',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'rgb(95, 186, 233)',
      }).then((result) => {
        if (!result.isConfirmed) {
          return;
        }
        //preciono registrarse
        this.router.navigate(['/register']);
      });
      return;
    }
    //----------------------------------------------
    //Agregar Producto

    Swal.fire({
      title: 'Agregar Producto',
      input: 'text',
      inputAttributes: {
        autocapitalize: 'sentences',
      },
      showCancelButton: true,
      confirmButtonText: 'Agregar',
      confirmButtonColor: 'rgb(95, 186, 233)',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }

      //Verifico si no es vacio el nombre
      if (result.value.toString() == '' || result.value == null) {
        Swal.fire({
          title: `Agrege un nombre al producto.`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: 'rgb(95, 186, 233)',
        }).then(() => {
          this.agregarNuevoProducto();
        });
        return;
      }

      //Verifico que el producto no exista ya en la lista del usuario
      const productoExistente = this.listProductos.find(
        (producto) =>
          producto.nombre.toLowerCase() == result.value.toString().toLowerCase()
      );
      if (productoExistente) {
        Swal.fire({
          title: `"${result.value}" ya existe en la lista`,
          confirmButtonText: 'Aceptar',
          confirmButtonColor: 'rgb(95, 186, 233)',
        }).then(() => {
          this.agregarNuevoProducto();
        });
        return;
      }

      //Pasada las verificaciones creo el producto y lo guardo
      this.productoService.guardarProducto(result.value.toString()).subscribe({
        next: (producto) => {
          const newProducto = new Producto(producto.id, producto.nombre);
          newProducto.estado = this.NO_SELECCIONADO;
          this.listProductos.push(newProducto);
          Swal.fire({
            title: ` Se agrego "${newProducto.nombre}" correctamente`,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: 'rgb(95, 186, 233)',
          });
        },
        error: (error) => {
          Swal.fire({
            title: `Error.`,
            text: error,
            confirmButtonText: 'Aceptar',
            confirmButtonColor: 'rgb(95, 186, 233)',
          });
        },
        complete: () => {
          console.log("Complete save product");
        }
      });
    });
  }

  public eliminarProducto() {
    //Funcionalidad no permitida con usuario Anonimo.
    if (this.loginService.usuarioEsAnonimo()) {
      Swal.fire({
        title: `No permitido.`,
        text: 'Regístrese para utilizar esta función.',
        confirmButtonText: 'Registrarse',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'rgb(95, 186, 233)',
      }).then((result) => {
        if (!result.isConfirmed) {
          return;
        }
        //preciono registrarse
        this.router.navigate(['/register']);
      });
      return;
    }
    //----------------------------------------------
    //Eliminar Productos
    Swal.fire({
      title: `Ups.`,
      text: 'Aun no implementado.',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: 'rgb(95, 186, 233)',
    });
  }

  public comprasPorUsuario() {
    //Funcionalidad no permitida con usuario Anonimo.
    if (this.loginService.usuarioEsAnonimo()) {
      Swal.fire({
        title: `No permitido.`,
        text: 'Regístrese para utilizar esta función.',
        confirmButtonText: 'Registrarse',
        showCancelButton: true,
        cancelButtonText: 'Cancelar',
        confirmButtonColor: 'rgb(95, 186, 233)',
      }).then((result) => {
        if (!result.isConfirmed) {
          return;
        }
        //preciono registrarse
        this.router.navigate(['/register']);
      });
      return;
    }
    //----------------------------------------------
    //Compras por usuario
    this.router.navigate(["compras"])
  }

  public selectProducto(LI: HTMLLIElement) {
    const SELECCIONADO = this.SELECCIONADO;

    const NO_SELECCIONADO = this.NO_SELECCIONADO;

    //const EN_CARRITO = this.EN_CARRITO;

    if (LI.classList.contains(SELECCIONADO)) {
      LI.classList.remove(SELECCIONADO);
      LI.classList.add(NO_SELECCIONADO);

      //elimino el elemento de la lista de seleccioandos
      for (
        let index = 0;
        index < this.listProductosSeleccionados.length;
        index++
      ) {
        let prodS: Producto = this.listProductosSeleccionados[index];

        if (
          prodS.nombre.toLowerCase() ==
          (<HTMLParagraphElement>LI.firstElementChild!).innerHTML
            .trim()
            .toLowerCase()
        ) {
          //elimino el elemento de la lista de seleccionados
          this.listProductosSeleccionados.splice(index, 1);
          prodS.estado = NO_SELECCIONADO;

          //actualizo el local storage
          this.productoService.guardarListaSeleccionados(
            this.listProductosSeleccionados
          );

          //termino el bucle
          break;
        } else {
        }
      }
    } else if (LI.classList.contains(NO_SELECCIONADO)) {
      LI.classList.remove(NO_SELECCIONADO);
      LI.classList.add(SELECCIONADO);

      for (let producto of this.listProductos) {
        if (
          producto.nombre ==
          (<HTMLParagraphElement>LI.firstElementChild!).innerHTML.trim()
        ) {
          producto.estado = SELECCIONADO;
          //agrego el elemento a la lista de seleccionados
          this.listProductosSeleccionados.push(producto);

          //actualizo el local storage

          this.productoService.guardarListaSeleccionados(
            this.listProductosSeleccionados
          );

          //termino el bucle
          break;
        }
      }
    } else {
      //Sin efecto practico.
      /*Status "En Carrito" , no afecta aqui, no se puede quitar de la lista a un producto en carrito.
      debe quitarse desde el carrito.*/
    }
  }

  public ListaTerminada(): void {
    //guardo la lista de seleccionados en local. Y redirecciono a compras
    this.productoService.guardarListaSeleccionados(this.listProductosSeleccionados);
    this.router.navigate(['/carrito']);
  }

  //Se utiliza en el HTML
  public ordenarListaByNombre(nombre: string) {
    if (nombre == '') {
      this.listProductos.sort((a, b) => {
        if (a.nombre < b.nombre) {
          return -1;
        }
        if (a.nombre > b.nombre) {
          return 1;
        }
        return 1;
      });
    } else {
      this.listProductos.sort((a) => {
        if (a.nombre.toLowerCase().includes(nombre.toLowerCase())) {
          return -1;
        } else {
          return 1;
        }
      });
    }
  }

  /*Extras*/
  public irArriba() {
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
  }
  public irAbajo() {
    window.scroll({
      top: document.body.scrollHeight,
      left: 0,
      behavior: 'smooth',
    });
  }
}
