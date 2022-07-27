import { assert, assertFalse } from "std/testing/asserts";
import { describe, it } from "std/testing/bdd";
import { checkObject } from "./type_util.ts";

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
