import express from "express";

export function testServer(
  port: number,
  host: string = "127.0.0.1",
): Promise<{
  closeServer: () => void;
}> {
  return new Promise((resolve) => {
    // Create an Express application
    const app = express();

    // Define a route that responds with "Hello, World!"
    app.get("/", (req, res) => {
      res.send("Hello, World!");
    });


    app.on('close', () => {
      process.exit()
  })


    // Create an HTTP server and attach the Express app to it
    const server = app.listen(port, host, () => {
      console.log(`Server is listening on http://${host}:${port}`);
      resolve({
        closeServer: () => server.close(),
      });
    });
  });
}
