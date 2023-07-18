import dayjs from "dayjs";
import { convertToIcal } from "./ical";
import { Shift } from "../shiftworker/shiftworkerExportService";

const getDefaultInput = (): Shift[] => {
  return [
    {
      start: dayjs("2018-04-13 19:18"),
      end: dayjs("2018-04-13 22:18"),
      summary: "test",
    },
  ];
};

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
    const regex = new RegExp("BEGIN:VEVENT(.*?)END:VEVENT", "gs");
    const result = convertToIcal(getDefaultInput());
    const event = result.match(regex)![0];

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
        const event = result.match(regex)?.[0];
        const event2 = result.match(regex)?.[1];
        const uid = event?.match("UID:(.+)")?.[1];
        const uid2 = event2?.match("UID:(.+)")?.[1];
        expect(uid).not.toEqual(uid2);
      });
    });

    describe("dstart", () => {
      test("har en valid dato", () => {
        const dtstamp = event?.match("DTSTART:(.+)")?.[1];
        expect(dtstamp).toEqual(
          dayjs("2018-04-13 17:18").format("YYYYMMDDTHHmmss[Z]")
        );
      });
    });

    describe("dtend", () => {
      test("har en valid dato", () => {
        const dtstamp = event?.match("DTEND:(.+)")?.[1];
        expect(dtstamp).toEqual(
          dayjs("2018-04-13 20:18").format("YYYYMMDDTHHmmss[Z]")
        );
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
