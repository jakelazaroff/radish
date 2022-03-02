#!/usr/bin/env node
import cli from "../build/cli/index.js";

import { createRequire } from "module";
const { version } = createRequire(import.meta.url)("../package.json");

cli(process.argv.slice(2), version);
