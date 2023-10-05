import { testServer } from "./utils/server";
import { isPortOpen } from "../src/lib/index";
import { expect } from "chai";

describe("isPortOpen", () => {
  it("should return true for an open port", async () => {
    const isOpen = await isPortOpen(80);
    expect(isOpen).to.be.true;
  });

  for (let host of ["0.0.0.0", "127.0.0.1"]) {
    it(`should return false for a port that is already in use - host:${host}`, async () => {
      const { closeServer } = await testServer(8080, host);
      const isOpen = await isPortOpen(8080);
      expect(isOpen).to.be.false;
      closeServer();
    });
  }
  it("should return false for an invalid port", async () => {
    // Assuming an invalid port number

    const isOpen = await isPortOpen(9999999);
    expect(isOpen).to.be.false;
  });
});
