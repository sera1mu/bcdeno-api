import { assert, assertFalse, describe, it } from "../../dev_deps.ts";
import { checkObject } from "../../src/types/type_util.ts";

describe("type_util", () => {
  describe("checkObject", () => {
    type TestType = { hoge: string; foo: number };
    it("true pattern", () => {
      assert(checkObject<TestType>({
        hoge: "test",
        foo: 29,
      }, { hoge: "string", foo: "number" }));
    });

    it("different keys", () => {
      assertFalse(checkObject<TestType>({
        hoge: "test",
        foo: 29,
      }, { test: "string", aaa: "number" }));
    });

    it("different types", () => {
      assertFalse(checkObject<TestType>({
        hoge: 49,
        foo: null,
      }, { hoge: "string", foo: "number" }));
    });
  });
});
