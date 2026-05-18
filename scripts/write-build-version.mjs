import { writeFileSync } from "node:fs";

const buildId = new Date().toISOString();

writeFileSync(
  "public/sw-version.js",
  `self.SINCE_BUILD_ID = ${JSON.stringify(buildId)};\n`,
  "utf8"
);

