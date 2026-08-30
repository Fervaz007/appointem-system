export interface Service {
  id: string;
  name: string;
  duration: number; // en horas
  price: number;
  active: boolean;
  depositAmount: number; // monto del anticipo en la moneda local
}

