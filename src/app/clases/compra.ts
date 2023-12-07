import { Producto } from "./producto";

export const Supermercados = Object.freeze({
    SIN_ESPECIFICAR: 'Sin especificar',
    ALVEAR: 'Alvear',
    KILGELMANN: 'Kilgelmann',
    PETRELLI: 'Petrelli',
    TUNEL: 'Tunel',
    DIA: 'Dia'
  });

export class Compra {
     id: number | undefined = undefined
     productos: Producto[];
     total: number;
     presupuesto_inicial:number;
     fecha: string;
    supermercado:string;
  
    constructor(lista:Producto[],total:number,presupuesto_inicial:number,fecha:string,supermercado:string=Supermercados.SIN_ESPECIFICAR){
        this.productos=lista;
        this.total=total;
        this.presupuesto_inicial=presupuesto_inicial;
        this.fecha=fecha;
        this.supermercado=supermercado;
    }

}
