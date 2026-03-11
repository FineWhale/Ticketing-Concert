export interface Seat {
  id: string;
  section: string;
  block: string;
  row: string;
  number: number;
  status: "available" | "reserved" | "sold";
}
