import dayjs from "dayjs";
import {
  convertToIcal,
  convertToVEvent,
  ToIcalConfig,
  ValidTimeZone,
} from "./icalWriter";

import { Shift } from "../shiftworker/shiftworkerExportService";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { orElseThrow } from "../utils/result";
dayjs.extend(utc);
dayjs.extend(timezone);

const VEVENT_REGEX = new RegExp("BEGIN:VEVENT(.*?)END:VEVENT", "gs");
const IcalDatetimeFormat = "YYYYMMDDTHHmmss[Z]";
const OSLO_TIMEZONE = orElseThrow(ValidTimeZone.create("Europe/Oslo")).value;
const NEW_YORK_TIMEZONE = orElseThrow(
  ValidTimeZone.create("America/New_York")
).value;

const getDefaultInput = (): Shift[] => {
  return [
    {
      start: dayjs.tz("2018-04-13 07:30", "EUROPE/BERLIN"),
      end: dayjs.tz("2018-04-13 15:30", "EUROPE/BERLIN"),
      summary: "test",
    },
  ];
};

const defaultConfig = (): ToIcalConfig => {
  return { timezone: OSLO_TIMEZONE };
};

describe("Følger ICAL spesifikasjon", () => {
  describe("Overordnet", () => {
    test("starter med BEGIN", () => {
      expect(convertToIcal(getDefaultInput(), defaultConfig())).toStartWith(
        "BEGIN:VCALENDAR\n"
      );
    });

    test("slutter med END", () => {
      expect(convertToIcal(getDefaultInput(), defaultConfig())).toEndWith(
        "\nEND:VCALENDAR"
      );
    });

    test("inkluderer PRODID", () => {
      expect(convertToIcal(getDefaultInput(), defaultConfig())).toContain(
        "PRODID:-//hacksw/handcal//NONSGML v1.0//EN"
      );
    });

    test("inkluderer VERSION", () => {
      expect(convertToIcal(getDefaultInput(), defaultConfig())).toContain(
        "VERSION:2.0"
      );
    });

    test("inkluderer minst ett VEVENT", () => {
      expect(convertToIcal(getDefaultInput(), defaultConfig())).toContain(
        "BEGIN:VEVENT"
      );
      expect(convertToIcal(getDefaultInput(), defaultConfig())).toContain(
        "END:VEVENT"
      );
    });

    test("har ingen tomme linjer", () => {
      const output = convertToIcal(getDefaultInput(), defaultConfig());
      const emptyLines = output.match(/^[ \t]*$/gm)?.length || 0;
      expect(emptyLines).toBe(0);
    });
  });

  describe("For VEvent", () => {
    const result = convertToIcal(getDefaultInput(), defaultConfig());
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
        const result = convertToIcal(
          [...getDefaultInput(), ...getDefaultInput()],
          defaultConfig()
        );
        const event = result.match(VEVENT_REGEX)?.[0];
        const event2 = result.match(VEVENT_REGEX)?.[1];
        const uid = event?.match("UID:(.+)")?.[1];
        const uid2 = event2?.match("UID:(.+)")?.[1];
        expect(uid).not.toEqual(uid2);
      });
    });

    describe("dstart", () => {
      test("har en valid dato", () => {
        const result = convertToIcal(getDefaultInput(), defaultConfig());
        const dtstart = extractField(result, "DTSTART");
        expect(dayjs(dtstart, IcalDatetimeFormat).isValid());
      });
    });

    describe("dtend", () => {
      test("har en valid dato", () => {
        const result = convertToIcal(getDefaultInput(), defaultConfig());
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
        const result = convertToIcal([...input], {
          ...defaultConfig(),
          prefix: "Ingrid: ",
        });
        const summary = result?.match("SUMMARY:(.+)")?.[1];
        expect(summary).toEqual(`Ingrid: ${input[0].summary}`);
      });
    });
  });
});

describe("Konverterer tidspunkter", () => {
  test("For tidspunkter med tidssone i EUROPE/BERLIN", () => {
    const shift = {
      start: dayjs.tz("2018-04-13 07:00", "EUROPE/BERLIN"),
      end: dayjs.tz("2018-04-13 15:30", "EUROPE/BERLIN"),
      summary: "Day Shift",
    };
    const result = convertToVEvent(shift, defaultConfig());
    const dtstart = extractField(result, "DTSTART");

    expect(dtstart).toEqual("TZID=Europe/Oslo:20180413T070000");
  });

  test("For tidspunkter i New York", () => {
    const shift = {
      start: dayjs.utc("2018-04-13 07:00"),
      end: dayjs.utc("2018-04-13 15:30"),
      summary: "Day Shift",
    };
    const result = convertToVEvent(shift, {
      ...defaultConfig(),
      timezone: NEW_YORK_TIMEZONE,
    });
    const dtstart = extractField(result, "DTSTART");

    expect(dtstart).toEqual("TZID=America/New_York:20180413T070000");
  });
});

const extractField = (result: string, field: "DTSTART" | "DTEND") => {
  const event = result.match(VEVENT_REGEX)![0];
  return event?.match(`${field}(?::|;)(.+)`)?.[1];
};
