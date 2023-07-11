import { Database } from "sqlite3";

const sqlite3 = require("sqlite3").verbose();

export const initializeShiftworkerDbRepository = (
  inputFilename: string
): Promise<ShiftworkerDbRepository> => {
  return new Promise((res, reject) => {
    const db = new sqlite3.Database(
      inputFilename,
      async (err: Error | null) => {
        if (err) {
          reject(`Error initializing ShiftworkerDbRepository: ${err}`);
        } else {
          console.log(
            `ShiftworkerDbRepository successfully initialized with file ${inputFilename}`
          );
          res(new ShiftworkerDbRepository(db));
        }
      }
    );
  });
};

class ShiftworkerDbRepository implements ShiftworkerRepository {
  private db: Database;

  constructor(db: Database) {
    this.db = db;
  }

  getShifts(): Promise<ShiftDB[]> {
    return new Promise((res, reject) => {
      this.db.all("SELECT * FROM shifts", (err: string, rows: ShiftDB[]) => {
        if (err) {
          reject(`Error reading shifts from shifts table: ${err}`);
        }
        res(rows);
      });
    }).then((res: unknown) => {
      if (!res) {
        throw new Error(
          "Expected input file to have database rows, but instead it was undefined. TEST"
        );
      }
      return res as ShiftDB[];
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
