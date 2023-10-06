import { PORT_TERMINATOR_RESPONSE } from "./types";
import { exec } from "child_process";
import { promisify } from "util";
import { ERRORS } from "./portError";

/**
 * Promisify the exec function, making it return a Promise
 */
const executeCommand = promisify(exec);

/**
 * Validates if a port number is within the valid range (0 to 65535).
 *
 * @param {number} port - The port number to validate.
 * @returns {boolean} - `true` if the port number is valid, `false` otherwise.
 *
 * @example
 * // Example usage:
 * const portToValidate = 8080;
 * const isValid = validatePort(portToValidate);
 * if (isValid) {
 *   console.log(`Port ${portToValidate} is valid.`);
 * } else {
 *   console.error(`Port ${portToValidate} is not valid.`);
 * }
 */
function validatePort(port: number) {
  // Check if the port is greater than or equal to 0 AND less than 65536.
  if (!(port >= 0 && port < 65536)) {
    // If the condition is not met, return false (invalid port).
    return false;
  }
  // If the condition is met, return true (valid port).
  return true;
}
/**
 * Retrieves the Process IDs (PIDs) associated with a list of ports.
 *
 * @param {number[]} portsToMonitor - An array of port numbers to monitor.
 * @returns {Promise<{ [port: number]: number[] }>} - An object mapping ports to arrays of PIDs.
 *
 * @example
 * // Example usage:
 * async function main() {
 *   const ports = [80, 443]; // Replace with the port numbers you want to monitor
 *   try {
 *     const portPIDs = await getPortsPIDs(ports);
 *     for (const port in portPIDs) {
 *       const pids = portPIDs[port];
 *       console.log(`Port ${port} is associated with PIDs: ${pids.join(', ')}`);
 *     }
 *   } catch (error) {
 *     console.error('Error retrieving port PIDs:', error);
 *   }
 * }
 *
 * // Call the main function to start the process
 * main();
 */
export async function getPortsPIDs(portsToMonitor: number[]) {
  const portPIDs: {
    [port: number]: number[];
  } = {};

  if (process.platform === "win32") {
    // Windows
    const portList = portsToMonitor.join(",");
    const { stdout } = await executeCommand(`netstat -ano | findstr :${portList}`);
    const lines = stdout.split("\n");

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const port = parts[1].split(":")[1];
      const pid = parts[4];

      if (port && pid && pid) {
        if (!portPIDs[port]) {
          portPIDs[port] = [];
        }
        portPIDs[port].push(Number(pid));
      }
    }
  } else {
    // macOS/Linux
    const { stdout } = await executeCommand("lsof -i -n -P | grep LISTEN");
    const lines = stdout.split("\n");

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);

      for (const port of portsToMonitor) {
        if (parts[8] && parts[8].endsWith(`:${port}`)) {
          const pid = parts[1];

          if (!portPIDs[port]) {
            portPIDs[port] = [];
          }
          portPIDs[port].push(Number(pid));
        }
      }
    }
  }

  return portPIDs;
}

/**
 * Retrieves the Process IDs (PIDs) associated with a specific port.
 *
 * @param {number} port - The port number to retrieve PIDs for.
 * @returns {Promise<number[]>} - An array of PIDs associated with the specified port.
 *
 * @example
 * // Example usage:
 * async function main() {
 *   const port = 80; // Replace with the port number you want to query
 *
 *   try {
 *     const pids = await getPortPIDs(port);
 *
 *     if (pids.length > 0) {
 *       console.log(`PIDs associated with port ${port}: ${pids.join(', ')}`);
 *     } else {
 *       console.log(`No processes found for port ${port}.`);
 *     }
 *   } catch (error) {
 *     console.error(`Error retrieving PIDs for port ${port}:`, error);
 *   }
 * }
 *
 * // Call the main function to start the process
 * main();
 */
export async function getPortPIDs(port: number) {
  return (await getPortsPIDs([port]))[port] || [];
}

/**
 * Checks if a port is open or closed.
 *
 * @param {number} port - The port number to check.
 * @returns {Promise<boolean>} - `true` if the port is open, `false` if it's closed or invalid.
 *
 * @example
 * // Example usage:
 * async function main() {
 *   const portToCheck = 8080; // Replace with the port number you want to check
 *   try {
 *     const isOpen = await isPortOpen(portToCheck);
 *     if (isOpen) {
 *       console.log(`Port ${portToCheck} is open.`);
 *     } else {
 *       console.log(`Port ${portToCheck} is closed or invalid.`);
 *     }
 *   } catch (error) {
 *     console.error('Error checking port status:', error);
 *   }
 * }
 *
 * // Call the main function to start the process
 * main();
 */
export async function isPortOpen(port: number): Promise<boolean> {
  // Check if the provided port is valid
  if (!validatePort(port)) {
    return false;
  }

  // Get the Process IDs (PIDs) associated with the port
  const processIds = await getPortPIDs(port);

  // Return true if there are no PIDs associated with the port (port is open)
  return processIds?.length === 0;
}

/**
 * Terminates processes with the specified Process IDs (PIDs).
 *
 * @param {number[]} pids - An array of Process IDs (PIDs) to terminate.
 * @throws {PortError} - Throws a PortError if an error occurs during process termination.
 *
 * @example
 * // Example usage:
 * async function main() {
 *   const pidsToKill = [12345, 67890]; // Replace with the PIDs you want to terminate
 *   try {
 *     await killPIDs(pidsToKill);
 *     console.log('Processes terminated successfully.');
 *   } catch (error) {
 *     console.error('Error terminating processes:', error);
 *   }
 * }
 *
 * // Call the main function to start the process
 * main();
 */
export async function killPIDs(pids: number[]) {
  let command = "";
  if (process.platform === "win32") {
    // Windows
    command = `taskkill /F /PID ${pids.join(" /PID ")}`;
  } else {
    // macOS/Linux
    command = `kill -15 ${pids.join(" ")}`;
  }
  try {
    // Execute the command to terminate processes
    await executeCommand(command);
  } catch (error: any) {
    // If an error occurs during process termination, throw a default error
    throw ERRORS.DEFAULT_ERROR(error);
  }
}

/**
 * Terminates processes associated with the specified port.
 *
 * @param {number} port - The port number to terminate processes for.
 * @throws {PortError} - Throws a PortError if an error occurs during process termination or if the port is invalid or not associated with any processes.
 *
 * @example
 * // Example usage:
 * async function main() {
 *   const portToTerminate = 8080; // Replace with the port number you want to terminate processes for
 *   try {
 *     await portTerminator(portToTerminate);
 *     console.log(`Processes associated with port ${portToTerminate} terminated successfully.`);
 *   } catch (error) {
 *     console.error('Error terminating processes:', error);
 *   }
 * }
 *
 * // Call the main function to start the process
 * main();
 */
export async function portTerminator(port: number) {
  if (!validatePort(port)) {
    // If the port is not valid, throw a bad port error
    throw ERRORS.ERR_SOCKET_BAD_PORT(port);
  }

  const processIds = await getPortPIDs(port);
  if (processIds?.length) {
    try {
      // Terminate processes associated with the port
      await killPIDs(processIds);
    } catch (error: any) {
      // If an error occurs during process termination, throw a default error
      throw ERRORS.DEFAULT_ERROR(error);
    }
  } else {
    // If there are no processes associated with the port, throw a port already open error
    throw ERRORS.ERR_SOCKET_PORT_ALREADY_OPEN(port);
  }
}

/**
 * Terminates processes associated with multiple specified ports.
 *
 * @param {...number[]} ports - An array of port numbers to terminate processes for.
 * @returns {Promise<Map<number, PORT_TERMINATOR_RESPONSE>>} - A Map with port numbers as keys and termination responses as values.
 *
 * @example
 * // Example usage:
 * async function main() {
 *   const portsToTerminate = [8080, 3000, 5000]; // Replace with the port numbers you want to terminate processes for
 *   try {
 *     const terminationResults = await portsTerminator(...portsToTerminate);
 *     terminationResults.forEach((response, port) => {
 *       if (response.status) {
 *         console.log(`Processes associated with port ${port} terminated successfully.`);
 *       } else {
 *         console.error(`Error terminating processes for port ${port}:`, response.error);
 *       }
 *     });
 *   } catch (error) {
 *     console.error('Error terminating processes:', error);
 *   }
 * }
 *
 * // Call the main function to start the process
 * main();
 */
export async function portsTerminator(
  ...ports: Array<number>
): Promise<Map<number, PORT_TERMINATOR_RESPONSE>> {
  const uniquePorts = [...new Set(ports)];

  const portPids = await getPortsPIDs(uniquePorts.filter(validatePort));

  const pidsToKill: number[] = [];

  const resultMap = new Map<number, PORT_TERMINATOR_RESPONSE>();

  uniquePorts.forEach((port) => {
    const processIds = portPids[port];

    if (processIds) {
      pidsToKill.push(...processIds);
      resultMap.set(port, {
        status: true,
      });
    } else {
      resultMap.set(port, {
        status: false,
        error: validatePort(port)
          ? ERRORS.ERR_SOCKET_PORT_ALREADY_OPEN(port)
          : ERRORS.ERR_SOCKET_BAD_PORT(port),
      });
    }
  });

  try {
    if (pidsToKill.length) {
      await killPIDs(pidsToKill);
    }
  } catch (error) {
    const nonKillPids = await getPortsPIDs(uniquePorts);

    uniquePorts.forEach((port) => {
      if (nonKillPids[port]) {
        resultMap.set(port, {
          status: false,
          error: ERRORS.ERR_SOCKET_UNABLE_TO_KILL_PORT(port),
        });
      }
    });
  }

  return resultMap;
}
