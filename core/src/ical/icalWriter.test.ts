import dayjs from "dayjs";
import { convertToIcal, convertToVEvent } from "./icalWriter";

import { Shift } from "../shiftworker/shiftworkerExportService";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(utc);
dayjs.extend(timezone);
const getDefaultInput = (): Shift[] => {
  return [
    {
      start: dayjs.tz("2018-04-13 07:30", "EUROPE/BERLIN"),
      end: dayjs.tz("2018-04-13 15:30", "EUROPE/BERLIN"),
      summary: "test",
    },
  ];
};

const VEVENT_REGEX = new RegExp("BEGIN:VEVENT(.*?)END:VEVENT", "gs");
const IcalDatetimeFormat = "YYYYMMDDTHHmmss[Z]";

describe("Følger ICAL spesifikasjon", () => {
  describe("Overordnet", () => {
    test("starter med BEGIN", () => {
      expect(convertToIcal(getDefaultInput())).toStartWith("BEGIN:VCALENDAR\n");
    });

    test("slutter med END", () => {
      expect(convertToIcal(getDefaultInput())).toEndWith("\nEND:VCALENDAR");
    });

    test("inkluderer PRODID", () => {
      expect(convertToIcal(getDefaultInput())).toContain(
        "PRODID:-//hacksw/handcal//NONSGML v1.0//EN"
      );
    });

    test("inkluderer VERSION", () => {
      expect(convertToIcal(getDefaultInput())).toContain("VERSION:2.0");
    });

    test("inkluderer minst ett VEVENT", () => {
      expect(convertToIcal(getDefaultInput())).toContain("BEGIN:VEVENT");
      expect(convertToIcal(getDefaultInput())).toContain("END:VEVENT");
    });

    test("har ingen tomme linjer", () => {
      const output = convertToIcal(getDefaultInput());
      const emptyLines = output.match(/^[ \t]*$/gm)?.length || 0;
      expect(emptyLines).toBe(0);
    });
  });

  describe("For VEvent", () => {
    const result = convertToIcal(getDefaultInput());
    const event = result.match(VEVENT_REGEX)![0];

    test("har påkrevde felter", () => {
      expect(event).toContain("DTSTAMP");
      expect(event).toContain("UID");
    });

    describe("dtstamp", () => {
      test("har en valid dato", () => {
        const dtstamp = event?.match("DTSTAMP:(.+)")?.[1];
        expect(dtstamp).toBeDefined();
      });
    });

    describe("uid", () => {
      test("har domenet for quister.org til slutt", () => {
        const uid = event?.match("UID:(.+)")?.[1];
        expect(uid).toEndWith("@quister.org");
      });

      test("Har unike identfikatorer", () => {
        const result = convertToIcal([
          ...getDefaultInput(),
          ...getDefaultInput(),
        ]);
        const event = result.match(VEVENT_REGEX)?.[0];
        const event2 = result.match(VEVENT_REGEX)?.[1];
        const uid = event?.match("UID:(.+)")?.[1];
        const uid2 = event2?.match("UID:(.+)")?.[1];
        expect(uid).not.toEqual(uid2);
      });
    });

    describe("dstart", () => {
      test("har en valid dato", () => {
        const result = convertToIcal(getDefaultInput());
        const dtstart = extractField(result, "DTSTART");
        expect(dayjs(dtstart, IcalDatetimeFormat).isValid());
      });
    });

    describe("dtend", () => {
      test("har en valid dato", () => {
        const result = convertToIcal(getDefaultInput());
        const dtend = extractField(result, "DTEND");
        expect(dayjs(dtend, IcalDatetimeFormat).isValid());
      });
    });

    describe("summary", () => {
      test("har en summary", () => {
        const summary = event?.match("SUMMARY:(.+)")?.[1];
        expect(summary).toBeDefined();
      });

      test("legger til prefix hvis definert", () => {
        const input = getDefaultInput();
        const result = convertToIcal([...input], { prefix: "Ingrid: " });
        const summary = result?.match("SUMMARY:(.+)")?.[1];
        expect(summary).toEqual(`Ingrid: ${input[0].summary}`);
      });
    });
  });
});

describe("Konverterer datoer", () => {
  test("For datoer med tidssone i EUROPE/BERLIN", () => {
    const shift = {
      start: dayjs.tz("2018-04-13 07:00", "EUROPE/BERLIN"),
      end: dayjs.tz("2018-04-13 15:30", "EUROPE/BERLIN"),
      summary: "Day Shift",
    };
    const result = convertToVEvent(shift);
    const dtstart = extractField(result, "DTSTART");

    expect(dtstart).toEqual("20180413T050000Z");
  });

  test("For datoer i utc", () => {
    const shift = {
      start: dayjs.utc("2018-04-13 07:00"),
      end: dayjs.utc("2018-04-13 15:30"),
      summary: "Day Shift",
    };
    const result = convertToVEvent(shift);
    const dtstart = extractField(result, "DTSTART");

    expect(dtstart).toEqual("20180413T070000Z");
  });
});

function extractField(result: string, field: "DTSTART" | "DTEND") {
  const event = result.match(VEVENT_REGEX)![0];
  return event?.match(`${field}:(.+)`)?.[1];
}
