#!/usr/bin/env node
'use strict'

import { portsTerminator } from "../lib/index";

(async () => {
  console.time("Port Kill In");
  const ports = process.argv.slice(2).map((value) => Number(value));
  const uniquePort = [...new Set(ports)];
  const portResult = await portsTerminator(...uniquePort);
  for (const [port, value] of portResult.entries()) {
    const message =
      value.status == true ? `Port ${port} ternimanated successfully.` : value.error?.message;

    console.log(message);
  }
  console.timeEnd("Port Kill In");
})();
