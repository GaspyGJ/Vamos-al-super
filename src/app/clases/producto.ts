export const Estados_productos = Object.freeze({
  SELECCIONADO: 'seleccionado',
  NO_SELECCIONADO: 'no_seleccionado',
  EN_CARRITO: 'en_carrito',
  ELIMINADO: 'eliminado',
});
export const Unidad_productos = Object.freeze({
  KILOGRAMO: 'kg',
  UNIDAD: 'un',
  GRAMOS: 'gr',
  LITROS: 'lt',
});
export const Categorias_productos = Object.freeze({
  GENERAL: 'general',
});

export class Producto {
  id: number | undefined;
  nombre: string;
  estado: string | undefined;
  compra_id?: number | undefined;
  precio: number | undefined;
  cantidad: number | undefined;
  unidad_cantidad: string | undefined; // unidad de la cantidad llevada
  unidad_precio: string | undefined; // unidad del precio
  //Ej: LLevo 500 GR de uvas , pero el precio es en KG
  total_precio: number | undefined;

  constructor(
    id: number | undefined = undefined,
    nombre: string,
    cantidad: number | undefined = undefined,
    precio: number | undefined = undefined,
    total_precio: number | undefined = undefined,
    unidad_cantidad: string | undefined = undefined,
    unidad_precio: string | undefined = undefined,
    compra_id: number | undefined = undefined
  ) {
    this.id = id;
    this.nombre = nombre;
    this.compra_id = compra_id;
    this.cantidad = cantidad;
    this.precio = precio;
    this.total_precio = total_precio;
    this.unidad_cantidad = unidad_cantidad;
    this.unidad_precio = unidad_precio;
  }
}
