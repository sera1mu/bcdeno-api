import BCDiceAPIClient, {
  BCDiceOriginalTable,
} from "https://deno.land/x/bcdeno_api/mod.ts";

const SERVER = "https://bcdice.onlinesession.app";
const client = BCDiceAPIClient.create(SERVER);

console.log("getAPIVersion:");
console.log(await client.getAPIVersion());

console.log("getAPIAdmin:");
console.log(await client.getAPIAdmin());

console.log("getAvailableGameSystems:");
console.log(await client.getAvailableGameSystems());

console.log("getGameSystem(Cthulhu7th):");
console.log(await client.getGameSystem("Cthulhu7th"));

console.log("diceRoll(Cthulhu7th, 1D100):");
console.log(await client.diceRoll("Cthulhu7th", "1D100"));

console.log("diceRoll(Cthulhu7th, 1D100<=50):");
console.log(await client.diceRoll("Cthulhu7th", "1D100<=50"));

console.log("runOriginalTable(");
const table = new BCDiceOriginalTable({
  title: "hogehoge",
  command: "1D6",
  items: [
    "天然水",
    "カルピス",
    "コカ・コーラ",
    "ペプシ",
    "三ツ矢サイダー",
    "オレンジジュース",
  ],
});
console.log(table.toBCDiceText());
console.log("):");
console.log(await client.runOriginalTable(table));
