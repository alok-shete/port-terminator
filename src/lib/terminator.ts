import { PORT_TERMINATOR_RESPONSE } from "./types";
import { exec } from "child_process";
import { promisify } from "util";
import { ERRORS } from "./portError";

const executeCommand = promisify(exec);

function validatePort(port: number) {
  if (!(port >= 0 && port < 65536)) {
    return false;
  }
  return true;
}

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

export async function getPortPIDs(port: number) {
  return (await getPortsPIDs([port]))[port] || [];
}

export async function isPortOpen(port: number): Promise<boolean> {
  if (!validatePort(port)) {
    return false;
  }
  const processIds = await getPortPIDs(port);
  return processIds?.length == 0;
}

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
    await executeCommand(command);
  } catch (error: any) {
    throw ERRORS.DEFAULT_ERROR(error);
  }
}

export async function portTerminator(port: number) {
  if (!validatePort(port)) {
    throw ERRORS.ERR_SOCKET_BAD_PORT(port);
  }
  const processIds = await getPortPIDs(port);
  if (processIds?.length) {
    try {
      await killPIDs(processIds);
    } catch (error: any) {
      throw ERRORS.DEFAULT_ERROR(error);
    }
  } else {
    throw ERRORS.ERR_SOCKET_PORT_ALREADY_OPEN(port);
  }
}

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
