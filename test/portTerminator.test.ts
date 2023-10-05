import { testServer } from "./utils/server";
import { portTerminator } from "../src/lib/index";

describe("portTerminator", () => {
  it.only("should terminate a process on a valid port", async () => {
    const port = 5501;

    process.stdin.resume();

process.on("SIGINT", (signal, code) => {
  console.log("signal:", signal);
  console.log("code:", code);
  // process.exit(128 + code);
});
    await testServer(port);
    await portTerminator(port);
  });

  it("should throw an error for an invalid port", async () => {
    const invalidPort = -1;

    try {
      await portTerminator(invalidPort);
    } catch (error: any) {
      console.log(error.message);
      console.log(error.code);
      console.log(error.name);
    }
  });

  it("should throw an error for an port alerady code", async () => {
    try {
      await portTerminator(4000);
    } catch (error: any) {
      console.log(error.message);
      console.log(error.code);
      console.log(error.name);
    }
  });
});
