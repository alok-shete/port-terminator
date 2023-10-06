# Port Terminator

![License](https://img.shields.io/npm/l/port-terminator)
![Version](https://img.shields.io/npm/v/port-terminator)

Port Terminator is an npm library for managing and terminating processes associated with specific ports on your system.

```shell
npm install port-terminator
# OR
yarn add port-terminator
```

## Usage

### Importing the Library

Import the library in your Node.js application:

```javascript
const { portTerminator, isPortOpen, portsTerminator } = require("port-terminator");
// or using ES6 import
import { portTerminator, isPortOpen, portsTerminator } from "port-terminator";
```

### Terminating Processes for a Single Port

Use `portTerminator` to terminate processes associated with a single port:

```javascript
const portToTerminate = 8080;
try {
  await portTerminator(portToTerminate);
  console.log(`Processes associated with port ${portToTerminate} terminated successfully.`);
} catch (error) {
  console.error(`Error terminating processes for port ${portToTerminate}:`, error);
}
```

### Checking if a Port is Open

Use `isPortOpen` to check if a port is open:

```javascript
const portToCheck = 3000;
try {
  const isOpen = await isPortOpen(portToCheck);
  if (isOpen) {
    console.log(`Port ${portToCheck} is open.`);
  } else {
    console.log(`Port ${portToCheck} is closed or invalid.`);
  }
} catch (error) {
  console.error(`Error checking port status for port ${portToCheck}:`, error);
}
```

### Terminating Processes for Multiple Ports

Use `portsTerminator` to terminate processes associated with multiple ports:

```javascript
const portsToTerminate = [8080, 3000, 5000];
try {
  const terminationResults = await portsTerminator(...portsToTerminate);
  terminationResults.forEach((response, port) => {
    if (response.status) {
      console.log(`Processes associated with port ${port} terminated successfully.`);
    } else {
      console.error(`Error terminating processes for port ${port}:`, response.error);
    }
  });
} catch (error) {
  console.error("Error terminating processes:", error);
}
```

## Command-Line Interface (CLI)

You can use `port-terminator` as a global package.

### Installation

Install the package globally using npm:

```shell
npm install --global port-terminator
# OR
yarn global add port-terminator
```

### Using the CLI

#### Terminating Processes for a Single Port

To terminate processes associated with a single port, run the following command:

```shell
port-terminator 8080
```

Replace `8080` with the port number you want to terminate processes for.

#### Terminating Processes for Multiple Ports

You can also terminate processes for multiple ports by specifying multiple port numbers:

```shell
port-terminator 9000 3000 5000
```

Replace `9000`, `3000`, and `5000` with the port numbers you want to terminate processes for.

> Please note that you need administrative or superuser privileges to terminate processes on some systems. Ensure you have the necessary permissions before using this command.

## License

This library is open-source and available under the [MIT License](LICENSE).
