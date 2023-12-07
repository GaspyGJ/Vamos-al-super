//Clases
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import Swal from 'sweetalert2';
//Servicios
import { ToastrService } from 'ngx-toastr';
import { ProductoService } from 'src/app/servicios/producto.service';
import { CompraService } from 'src/app/servicios/compra.service';
import {
  Categorias_productos,
  Estados_productos,
  Producto,
  Unidad_productos,
} from 'src/app/clases/producto';
import { Compra } from 'src/app/clases/compra';
import { LoginService } from 'src/app/servicios/login.service';

@Component({
  selector: 'app-carrito',
  templateUrl: './carrito.component.html',
  styleUrls: ['./carrito.component.css'],
})
export class CarritoComponent implements OnInit {
  presupuesto_inicial: number = 0;
  totalActual: number = 0;
  unidadChecked_cantidad: string = Unidad_productos.UNIDAD;
  unidadChecked_precio: string = Unidad_productos.KILOGRAMO;

  numberEdit: number | null = null;

  listaProductosSeleccionados: Producto[] = [];

  constructor(
    private router: Router,
    private productoService: ProductoService,
    private compraService: CompraService,
    private loginService: LoginService,
    private toastr: ToastrService
  ) { }

  ngOnInit(): void {
    if (this.compraService.existeCompra()) {
      // busco el total
      this.totalActual = this.compraService.getTotalCarrito()!;
    } else {
      this.compraService.setCompraSinFinalizar();
      this.totalActual = 0;
    }
    // busco los productos seleccionados
    this.listaProductosSeleccionados = this.productoService.getSeleccionados()!;
    //Si hay seteado un presupuesto lo obtengo, sino se lo pido al usuario
    const presupuestoInicial = this.compraService.getPresupuestoInicial();
    if (presupuestoInicial) {
      this.presupuesto_inicial = this.compraService.getPresupuestoInicial()!;
    } else {
      Swal.fire({
        title: 'Presupuesto',
        text: 'Ingrese su presupuesto para esta compra:',
        input: 'number',
        inputAttributes: {
          autocapitalize: 'sentences',
        },
        showCancelButton: true,
        confirmButtonText: 'Aceptar',
        cancelButtonText: 'Omitir',
        confirmButtonColor: 'rgb(95, 186, 233)',
      })
        .then((result) => {
          //Sin presupuesto
          if (!result.isConfirmed) {
            this.toastr.warning('Sin presupuesto');
            this.presupuesto_inicial = 0;
            this.compraService.setPresupuestoInicial(this.presupuesto_inicial);
            return;
          }

          //Con presupuesto
          //verifico si no es vacio el campo , si es vacio, ingresa sin presupuesto
          if (result.value.toString() == '' || result.value == null) {
            this.toastr.warning('Sin presupuesto');
            this.presupuesto_inicial = 0;
            this.compraService.setPresupuestoInicial(this.presupuesto_inicial);
            return;
          }

          this.presupuesto_inicial = Number(result.value.toString());
          this.compraService.setPresupuestoInicial(this.presupuesto_inicial);
        })
        .catch((error) => {
          this.toastr.error('Error al ingresar presupuesto');
          console.error(error);
        });
    }
  }

  public async addProductoToCarrito(
    nombreProducto: string,
    cantidadProducto: string,
    precioProducto: string
  ) {
    //verifico tamanio de campos el metodo replace dado la elimina todos los espacios en blancos
    if (
      nombreProducto.replace(/\s/g, '') == '' ||
      cantidadProducto.replace(/\s/g, '') == '' ||
      precioProducto.replace(/\s/g, '') == ''
    ) {
      this.toastr.error('Rellenar todos los campos necesarios.');
      return;
    }
    if (Number(cantidadProducto) <= 0 || Number(precioProducto) <= 0) {
      this.toastr.error('Solo se permiten numeros mayores que cero');
      return;
    }

    //obtengo la unidad
    const radios_cantidad = document.getElementsByName('unidad_cantidad');
    let unidad_cantidad: string = '';
    radios_cantidad.forEach((radio) => {
      if ((<HTMLInputElement>radio).checked) {
        unidad_cantidad = (<HTMLInputElement>radio).value.toString();
      }
    });

    let unidadPrecio: string = unidad_cantidad;
    if (unidad_cantidad == 'gr' || unidad_cantidad == 'kg') {

      const radios_precio = document.getElementsByName('unidadPrecio');
      radios_precio.forEach((radio) => {
        if ((<HTMLInputElement>radio).checked) {
          unidadPrecio = (<HTMLInputElement>radio).value.toString();
        }
      });
    }

    //cambio los valores del producto por los valores ingresados
    let producto_estaba_seleccionado: boolean = false;
    let precioEnBaseACantidad: number = this.calcularPrecioEnBaseACantidad(
      cantidadProducto,
      precioProducto,
      unidad_cantidad,
      unidadPrecio
    );

    for (let productoS of this.listaProductosSeleccionados) {
      if (productoS.nombre == nombreProducto) {
        if (productoS.estado == Estados_productos.EN_CARRITO) {
          //si el producto estaba en el carrito (se ha editado), quito su precio del total
          if (!productoS.total_precio) {
            console.error('total_precio UNDEFINED');
          }
          this.totalActual -= productoS.total_precio!;
        }
        productoS.estado = Estados_productos.EN_CARRITO;
        productoS.cantidad = Number(cantidadProducto);
        productoS.precio = Number(Number(precioProducto).toFixed(2));
        productoS.unidad_cantidad = unidad_cantidad;
        productoS.unidad_precio = unidadPrecio;
        productoS.total_precio = precioEnBaseACantidad;

        producto_estaba_seleccionado = true;
        break;
      }
    }

    if (producto_estaba_seleccionado == false) {
      //si no estaba seleccionado, lo busco o lo creo.
      let producto: Producto;
      this.productoService.obtenerOrCrear(nombreProducto).subscribe({
        next: (response) => {
          const { id, nombre } = response;
          producto = new Producto(
            id,
            nombre,
            Number(cantidadProducto),
            Number(Number(precioProducto).toFixed(2)),
            precioEnBaseACantidad,
            unidad_cantidad,
            unidadPrecio
          );
          producto.estado = Estados_productos.EN_CARRITO;

          //agrego el producto nuevo a la lista de seleccionados
          //(es un producto que ingreso directamente no estaba en la lista)
          this.listaProductosSeleccionados.push(producto);
          this.listaProductosSeleccionados.sort((a, b) => {
            if (a.nombre < b.nombre) {
              return -1;
            }
            if (a.nombre > b.nombre) {
              return 1;
            }
            return 1;
          });

          this.totalActual += precioEnBaseACantidad;
          //Fixeo a 2 digitos el total
          this.totalActual = Number(this.totalActual.toFixed(2));

          //guardo los elementos que se agregaron
          this.productoService.guardarListaSeleccionados(
            this.listaProductosSeleccionados
          );
          this.compraService.setTotalCarrito(this.totalActual);

          //reseteo el form para que se blanqueen los campos
          (<HTMLFormElement>document.getElementById('formContent')).reset();

          this.SetChecked_cantidad(Unidad_productos.UNIDAD);

          this.toastr.success('Agregado al carrito');
        },
        error: (error) => {
          this.toastr.error('Compra No finalizada');
          if (error.error.message) {
            this.toastr.error(error.error.message);
          } else if (error.message) {
            this.toastr.error(error.message);
          } else {
            this.toastr.error('Error');
          }
          console.error('No se pudo finalizar la compra', error);
        },
        complete: () => {
          console.log("Complete get or create product");
        }
      });
    } else {
      this.totalActual += precioEnBaseACantidad;
      //Fixeo a 2 digitos el total
      this.totalActual = Number(this.totalActual.toFixed(2));

      //guardo los elementos que se modificarom
      this.productoService.guardarListaSeleccionados(
        this.listaProductosSeleccionados
      );
      this.compraService.setTotalCarrito(this.totalActual);

      //reseteo el form para que se blanqueen los campos
      (<HTMLFormElement>document.getElementById('formContent')).reset();

      this.SetChecked_cantidad(Unidad_productos.UNIDAD);

      this.toastr.success('Agregado al carrito');
    }
  }

  public eliminarProducto(producto: Producto) {
    Swal.fire({
      title: 'Estas seguro?',
      text: `Quitar "${producto.nombre}" del carrito`,
      icon: 'warning',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: 'rgb(95, 186, 233)',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        //busco el producto y le cambio el estado de en carrito a seleccionado.
        for (let prod of this.listaProductosSeleccionados) {
          if (prod.nombre == producto.nombre) {
            //actualizo el total
            if (producto.total_precio == null) {
              console.error('total_precio UNDEFINED');
            }
            this.totalActual -= producto.total_precio!;
            this.resetProducto(prod);
            break;
          }
        }
        //guardo los cambios
        this.productoService.guardarListaSeleccionados(
          this.listaProductosSeleccionados
        );
        this.compraService.setTotalCarrito(Number(this.totalActual.toFixed(2)));
      }
    });
  }

  public resetProducto(producto: Producto) {
    producto.estado = Estados_productos.SELECCIONADO;
    producto.precio = undefined;
    producto.cantidad = undefined;
    producto.precio = undefined;
    producto.total_precio = undefined;
    producto.unidad_cantidad = undefined;
    producto.unidad_precio = undefined;
  }

  public modificarProducto(
    producto: Producto,
    inombre: HTMLInputElement,
    i_cantidad: HTMLInputElement,
    i_precio: HTMLInputElement
  ) {
    //coloco la unidad
    const radios_cantidad = document.getElementsByName('unidad_cantidad');
    radios_cantidad.forEach((radio) => {
      if (
        (<HTMLInputElement>radio).value.toString() == producto.unidad_cantidad
      ) {
        (<HTMLInputElement>radio).checked = true;
        this.SetChecked_cantidad(producto.unidad_cantidad);
        return;
      }
    });
    const radios_precio = document.getElementsByName('unidadPrecio');
    radios_precio.forEach((radio) => {
      if (
        (<HTMLInputElement>radio).value.toString() == producto.unidad_precio
      ) {
        (<HTMLInputElement>radio).checked = true;
        this.SetChecked_precio(producto.unidad_precio);
        return;
      }
    });
    inombre.value = producto.nombre;
    i_cantidad.value = producto.cantidad!.toString()!;
    i_precio.value = producto.precio!.toString();
    window.scroll({ top: 0, left: 0, behavior: 'smooth' });
  }

  public volverArmarLista(): void {
    Swal.fire({
      title: 'Volver a la lista de compras?',
      icon: 'question',
      confirmButtonText: 'Aceptar',
      confirmButtonColor: 'rgb(95, 186, 233)',
      showCancelButton: true,
    }).then((result) => {
      if (result.isConfirmed) {
        if (this.listaProductosSeleccionados.length != 0) {
          this.compraService.setCompraSinFinalizar();
        }
        this.router.navigate(['lista']);
      }
    });
  }

  public finalizar(): void {
    Swal.fire({
      title: 'Finalizar Compra',
      showCancelButton: true,
      confirmButtonText: 'Finalizar',
      cancelButtonText: 'Continuar',
      confirmButtonColor: 'rgb(95, 186, 233)',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }
      this.guardarCompra();
    });
  }

  public guardarCompra() {
    const lista = this.getListProductosEnCarrito();
    const total = this.totalActual;
    const today = new Date();
    const yyyy = today.getFullYear().toString();
    let mm = (today.getMonth() + 1).toString(); // Months start at 0!
    let dd = today.getDate().toString();
    let hh = today.getHours().toString();
    let min = today.getMinutes().toString();
    let sec = today.getSeconds().toString();
    if (dd.length < 2) dd = '0' + dd;
    if (mm.length < 2) mm = '0' + mm;
    if (hh.length < 2) hh = '0' + hh;
    if (min.length < 2) min = '0' + min;
    if (sec.length < 2) sec = '0' + sec;

    const fecha = yyyy + '-' + mm + '-' + dd + " " + hh + ":" + min;
    const presupuesto_inicial = this.presupuesto_inicial;

    let compra: Compra = new Compra(lista, total, presupuesto_inicial, fecha);

    const id_usuario: number = this.loginService.getUsuario().id;

    this.compraService.guardarCompra(compra, id_usuario).subscribe({
      next: () => {
        this.compraService.removerCompra();
        this.toastr.success('Compra finalizada');
        this.router.navigate(['lista']);
      },
      error: (error: any) => {
        this.toastr.error('Compra No finalizada');
        if (error.error.message) {
          this.toastr.error(error.error.message);
        } else if (error.message) {
          this.toastr.error(error.message);
        } else {
          this.toastr.error('Error');
        }
        console.error('No se pudo finalizar la compra', error);
      },
      complete: () => {
        console.log("Complete save compra");
      }
    });
  }

  public cancelarCompra() {
    Swal.fire({
      title: 'Eliminar Compra',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Eliminar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: 'rgb(95, 186, 233)',
    }).then((result) => {
      if (!result.isConfirmed) {
        return;
      }
      this.compraService.removerCompra();
      this.toastr.success('Compra eliminada');
      this.router.navigate(['lista']);
    });
  }

  /*Extras*/

  public calcularPrecioEnBaseACantidad(
    cantidad: string,
    precio: string,
    unidad_cantidad: string,
    unidadPrecio: string
  ): number {
    if (
      unidad_cantidad == Unidad_productos.GRAMOS &&
      unidadPrecio == Unidad_productos.KILOGRAMO
    ) {
      return Number(((Number(cantidad) / 1000) * Number(precio)).toFixed(2));
    } else if (
      unidad_cantidad == Unidad_productos.KILOGRAMO &&
      unidadPrecio == Unidad_productos.GRAMOS
    ) {
      return Number((Number(cantidad) * 1000 * Number(precio)).toFixed(2));
    } else {
      return Number((Number(precio) * Number(cantidad)).toFixed(2));
    }
  }

  //Tomo el nombre del producto seleccionado y se lo asigno al Input de los nombres
  public click_producto_faltante(
    nombre_producto: HTMLParagraphElement,
    inputNombre: HTMLInputElement,
    inputCantidad: HTMLInputElement,
    inputPrecio: HTMLInputElement
  ) {
    for (let prod of this.listaProductosSeleccionados) {
      if (prod.nombre == nombre_producto.innerHTML.toString()) {
        let producto: Producto;
        producto = prod;

        inputNombre.value = producto.nombre;
        inputCantidad.value = '1';
        inputPrecio.value = '';
        window.scroll({ top: 0, left: 0, behavior: 'smooth' });
        break;
      }
    }
  }

  public getListProductosRestantes(): Producto[] {
    //me fijo que elementos de los seleccionados no tienen estatus en Carrito
    let listaProductosRestantes: Producto[] = [];

    this.listaProductosSeleccionados.forEach((prod) => {
      if (prod.estado != Estados_productos.EN_CARRITO) {
        listaProductosRestantes.push(prod);
      }
    });

    return listaProductosRestantes;
  }

  public getListProductosEnCarrito(): Producto[] {
    let listaProductosEnCarrito: Producto[] = [];
    this.listaProductosSeleccionados.forEach((prod) => {
      if (prod.estado == Estados_productos.EN_CARRITO) {
        listaProductosEnCarrito.push(prod);
      }
    });

    return listaProductosEnCarrito;
  }

  public SetChecked_cantidad(unidad: string) {
    //obtengo la unidad
    this.unidadChecked_cantidad = unidad;
  }
  public SetChecked_precio(unidad: string) {
    //obtengo la unidad
    this.unidadChecked_precio = unidad;
  }
}
