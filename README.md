# bcdeno_api

[![Test](https://img.shields.io/github/actions/workflow/status/sera1mu/bcdeno_api/test.yml?branch=main&label=Test&logo=github&logoColor=silver)](https://github.com/sera1mu/bcdeno_api/actions/workflows/test.yml)
[![Lint](https://img.shields.io/github/actions/workflow/status/sera1mu/bcdeno_api/lint.yml?branch=main&label=Lint&logo=github&logoColor=silver)](https://github.com/sera1mu/bcdeno_api/actions/workflows/lint.yml)
[![Format](https://img.shields.io/github/actions/workflow/status/sera1mu/bcdeno_api/format.yml?branch=main&label=Format&logo=github&logoColor=silver)](https://github.com/sera1mu/bcdeno_api/actions/workflows/format.yml)
[![Coverage](https://img.shields.io/codecov/c/github/sera1mu/bcdeno_api?logo=codecov)](https://app.codecov.io/gh/sera1mu/bcdeno_api)

BCDice-APIをDenoから簡単に使用するためのライブラリ

## Getting Started

### Requirements

- [Deno](https://deno.land)
- BCDice-API Server ([公開サーバー一覧](https://api-status.bcdice.org/))

### Example

手っ取り早い例を見るには、次のコマンドを実行してください:

```
deno run --allow-net https://deno.land/x/bcdeno_api/example.ts
```

実行されるスクリプトは以下のようなものです:

```typescript
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
```

## Maintainer

[@sera1mu](https://github.com/sera1mu)

## License

[MIT © 2023 Seraimu](https://github.com/sera1mu/bcdeno_api/blob/main/LICENSE)
