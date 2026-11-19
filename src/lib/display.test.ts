import { describe, expect, it } from "vitest";
import { splitDigits, stripDiacritics } from "./display";

describe("stripDiacritics", () => {
  it("maps every Romanian diacritic, both cedilla and comma forms, both cases", () => {
    expect(stripDiacritics("ăâîșşțţ")).toBe("aaisstt");
    expect(stripDiacritics("ĂÂÎȘŞȚŢ")).toBe("AAISSTT");
    expect(stripDiacritics("COȘUL TĂU · ÎNAPOI LA MENIU · LOCAȚIE")).toBe("COSUL TAU · INAPOI LA MENIU · LOCATIE");
  });
  it("leaves other characters alone", () => {
    expect(stripDiacritics("HOT BOY 39 LEI & Fries")).toBe("HOT BOY 39 LEI & Fries");
  });
});

describe("splitDigits", () => {
  it("isolates numbers so they can be rendered in Nunito", () => {
    expect(splitDigits("BRG-1042")).toEqual(["BRG-", "1042", ""]);
    expect(splitDigits("TOTAL 84,50 LEI")).toEqual(["TOTAL ", "84,50", " LEI"]);
    expect(splitDigits("COȘ")).toEqual(["COȘ"]);
  });
});
