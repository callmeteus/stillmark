#!/usr/bin/env node

import { runCli } from "../cli";

runCli(process.argv).then((exitCode) => {
    process.exit(exitCode);
});
