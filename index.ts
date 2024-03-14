#!/usr/bin/env node

import fg from "fast-glob";

const main = async () => {
  const gitIgnore = (await Bun.file(".gitignore").text())
    .split("\n")
    .filter((line) => line.length > 0 && line[0] !== "#")
    .map((line) => (line.endsWith("/") ? line.slice(0, -1) : line));

  const entries = (
    await fg("**/*", {
      ignore: gitIgnore,
    })
  ).filter(
    (file: string) =>
      file.endsWith(".ts") ||
      file.endsWith(".tsx") ||
      file.endsWith(".js") ||
      file.endsWith(".jsx") ||
      file.endsWith(".css") ||
      file.endsWith(".html")
  );

  const zIndexes = [];

  const valueWidth = 8;
  for (const entry of entries) {
    const content = await Bun.file(entry).text();

    let index = 0;
    while (index != -1) {
      if (
        entry.endsWith(".ts") ||
        entry.endsWith(".tsx") ||
        entry.endsWith(".js") ||
        entry.endsWith(".jsx")
      ) {
        index = content.indexOf("zIndex:", index);
        if (index != -1) {
          const possibleValue = content.slice(
            "zIndex:".length + index,
            "zIndex:".length + index + valueWidth
          );
          const value = possibleValue.match(/\d+/);
          if (value) {
            zIndexes.push({
              file: entry,
              value: parseInt(value[0]),
            });
          }
          index += valueWidth;
        }
      }
      if (entry.endsWith(".css") || entry.endsWith(".html")) {
        index = content.indexOf("z-index:", index);
        if (index != -1) {
          const possibleValue = content.slice(
            "z-index:".length + index,
            "z-index:".length + index + valueWidth
          );
          const value = possibleValue.match(/\d+/);
          if (value) {
            zIndexes.push({
              file: entry,
              value: parseInt(value[0]),
            });
          }
          index += valueWidth;
        }
      } else {
        index = -1;
      }
    }
  }

  zIndexes.sort((a, b) => a.value - b.value);

  console.log("z-index - file:");
  zIndexes.forEach((zIndex) => {
    console.log(`${zIndex.value} - ${zIndex.file}`);
  });
};

main();
