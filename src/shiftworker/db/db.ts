import { Database } from "sqlite3";

const sqlite3 = require("sqlite3").verbose();

export class ShiftworkerDbRepository implements ShiftworkerRepository {
  private db: Database;

  constructor(inputFilename: string) {
    this.db = new sqlite3.Database(inputFilename, async (err: Error | null) => {
      if (err) {
        console.error(err.message);
      }
    });
  }

  getShifts(): Promise<ShiftDB[]> {
    return new Promise((res, reject) => {
      this.db.all("SELECT * FROM shifts", (err: string, rows: ShiftDB[]) => {
        res(rows);
      });
    });
  }

  getShifttypes(): Promise<ShifttypeDB[]> {
    return new Promise((res, reject) => {
      this.db.all(
        "SELECT * FROM shifttype",
        (err: string, rows: ShifttypeDB[]) => {
          res(rows);
        }
      );
    });
  }
}

export interface ShiftDB {
  id: string;
  shifttype: string;
  date: string;
}

export interface ShifttypeDB {
  primarykey: string;
  start: string;
  end: string;
  description: string;
}

export interface ShiftworkerRepository {
  getShifts: () => Promise<ShiftDB[]>;
  getShifttypes: () => Promise<ShifttypeDB[]>;
}
