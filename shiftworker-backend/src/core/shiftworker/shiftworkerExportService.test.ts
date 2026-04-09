import { ShiftworkerExportService } from "./shiftworkerExportService";
import { ShiftworkerRepository, ShiftDB, ShifttypeDB } from "./db/db";

const makeRepository = (
  shifts: ShiftDB[],
  shifttypes: ShifttypeDB[]
): ShiftworkerRepository => ({
  getShifts: () => Promise.resolve(shifts),
  getShifttypes: () => Promise.resolve(shifttypes),
});

const SHIFT: ShiftDB = {
  id: "1",
  shifttype: "day",
  date: "04-13-2030 00:00:00",
};

const SHIFTTYPE: ShifttypeDB = {
  primarykey: "day",
  start: "07:30:00",
  end: "15:30:00",
  description: "Day Shift",
};

describe("ShiftworkerExportService", () => {
  describe("Timezone parsing", () => {
    test("parser skifttider som Oslo-tid når Europe/Oslo er valgt", async () => {
      const service = new ShiftworkerExportService(
        makeRepository([SHIFT], [SHIFTTYPE]),
        { debug: false, timezone: "Europe/Oslo" }
      );
      const shifts = await service.exportShifts();
      expect(shifts[0].start.utcOffset()).toBe(120); // UTC+2 (sommertid i april)
      expect(shifts[0].start.hour()).toBe(7);
      expect(shifts[0].start.minute()).toBe(30);
    });

    test("parser skifttider som New York-tid når America/New_York er valgt", async () => {
      const service = new ShiftworkerExportService(
        makeRepository([SHIFT], [SHIFTTYPE]),
        { debug: false, timezone: "America/New_York" }
      );
      const shifts = await service.exportShifts();
      expect(shifts[0].start.utcOffset()).toBe(-240); // UTC-4 (sommertid i april)
      expect(shifts[0].start.hour()).toBe(7);
      expect(shifts[0].start.minute()).toBe(30);
    });

    test("Oslo- og New York-skift med samme klokkeslett er ulike UTC-tidspunkter", async () => {
      const osloService = new ShiftworkerExportService(
        makeRepository([SHIFT], [SHIFTTYPE]),
        { debug: false, timezone: "Europe/Oslo" }
      );
      const nyService = new ShiftworkerExportService(
        makeRepository([SHIFT], [SHIFTTYPE]),
        { debug: false, timezone: "America/New_York" }
      );

      const [osloShifts, nyShifts] = await Promise.all([
        osloService.exportShifts(),
        nyService.exportShifts(),
      ]);

      // 07:30 Oslo (UTC+2) og 07:30 New York (UTC-4) er 6 timer fra hverandre
      const diffHours =
        (nyShifts[0].start.valueOf() - osloShifts[0].start.valueOf()) /
        (1000 * 60 * 60);
      expect(diffHours).toBe(6);
    });
  });
});
