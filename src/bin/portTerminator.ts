#!/usr/bin/env node
"use strict";

import { portsTerminator } from "../lib/index";

(async () => {
  // Get port numbers from command-line arguments
  const ports = process.argv.slice(2).map((value) => Number(value));
  // Ensure unique port numbers
  const uniquePort = [...new Set(ports)];
  // Call portsTerminator to terminate processes and get the results
  const portResult = await portsTerminator(...uniquePort);
  // Iterate through the results and print messages
  for (const [port, value] of portResult.entries()) {
    const message =
      value.status == true ? `Port ${port} ternimanated successfully.` : value.error?.message;

    console.log(message);
  }
})();
