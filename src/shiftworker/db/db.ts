import { Database } from "sqlite3";

const sqlite3 = require("sqlite3").verbose();

export const createDBRepository = (
  databaseFilename: string
): ShiftworkerRepository => {
  let db = new sqlite3.Database(databaseFilename, async (err: Error | null) => {
    if (err) {
      console.error(err.message);
    }
  });

  return {
    getShifts: () => readShifts(db),
    getShifttypes: () => readShifttypes(db),
  };
};

const readShifts = (db: Database): Promise<ShiftDB[]> => {
  return new Promise((res, reject) => {
    db.all("SELECT * FROM shifts", (err: string, rows: ShiftDB[]) => {
      res(rows);
    });
  });
};

const readShifttypes = (db: Database): Promise<ShifttypeDB[]> => {
  return new Promise((res, reject) => {
    db.all("SELECT * FROM shifttype", (err: string, rows: ShifttypeDB[]) => {
      res(rows);
    });
  });
};

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
