import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const readOutput = (name) =>
  readFile(new URL(`../out/${name}`, import.meta.url), "utf8");

test("builds the PeopleFlow workspace pages", async () => {
  const [home, preview, showcase] = await Promise.all([
    readOutput("index.html"),
    readOutput("preview.html"),
    readOutput("showcase.html"),
  ]);

  assert.match(home, /PeopleFlow/);
  assert.match(preview, /PeopleFlow/);
  assert.match(preview, /岗位人才库/);
  assert.match(showcase, /PeopleFlow/);
  const formerBrands = [["芳", "慕", "人才"].join(""), ["Talent", "Flow"].join("")];
  for (const brand of formerBrands) assert.doesNotMatch(`${home}${preview}${showcase}`, new RegExp(brand));
});

test("does not require a real Supabase project for local builds", async () => {
  const source = await readFile(new URL("../lib/supabase.ts", import.meta.url), "utf8");
  assert.match(source, /supabaseConfigured/);
  assert.match(source, /example\.supabase\.co/);
});
