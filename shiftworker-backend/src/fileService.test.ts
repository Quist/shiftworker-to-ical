import { toFileName } from "./fileService";

describe("toFileName", () => {
  test("lager en lesbar slug av kalendernavnet", () => {
    expect(toFileName("Ingrids vakter")).toEqual("ingrids-vakter");
  });

  test("fjerner aksenter og norske tegn", () => {
    expect(toFileName("Nattevakt på øya")).toEqual("nattevakt-pa-oya");
  });

  test("faller tilbake til standardnavn", () => {
    expect(toFileName(undefined)).toEqual("shiftworker");
    expect(toFileName("***")).toEqual("shiftworker");
  });

  test("begrenser lengden uten å ende på bindestrek", () => {
    const fileName = toFileName("a".repeat(30) + " " + "b".repeat(30));
    expect(fileName.length).toBeLessThanOrEqual(40);
    expect(fileName).not.toEndWith("-");
  });
});
