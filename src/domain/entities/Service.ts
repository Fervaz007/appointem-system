export interface Service {
  id: string;
  name: string;
  duration: number; // en horas o bloques
  price: number;
}

export const SERVICES: Service[] = [
  { id: "corte", name: "Corte de cabello", duration: 1, price: 20 },
  { id: "balayage", name: "Balayage", duration: 5, price: 150 },
  { id: "color", name: "Correcion de color", duration: 3, price: 80 },
  { id: "tinte", name: "Tinte", duration: 2, price: 60 },
];
