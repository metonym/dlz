import { expect, test } from "bun:test";
import { createExports } from "../src/create-exports";

test("create-exports", () => {
  expect(createExports("./tests/mocks")).toMatchSnapshot();
});
