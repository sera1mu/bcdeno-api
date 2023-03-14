import { BCDiceOriginalTable } from "../src/BCDiceOriginalTable.ts";
import { assertEquals, describe, it } from "../dev_deps.ts";

describe("BCDiceOriginalTable", () => {
  it("toBCDiceText", () => {
    const exceptedTable =
      "TestTable%0A1D6%0A1:A%0A2:%E3%81%82%0A3:b%0A4:%E3%81%B3%0A5:%E2%98%85%0A6:%EF%BC%8A";
    const actualTable = new BCDiceOriginalTable({
      title: "TestTable",
      command: "1D6",
      items: ["A", "あ", "b", "び", "★", "＊"],
    }).toBCDiceText();

    assertEquals(actualTable, exceptedTable);
  });
});
