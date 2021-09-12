const port = require("../lib/port");

test("should return x-real-port", () => {
  const req = {
    headers: {
      "x-real-port": "443",
    }
  };

  expect(port(req)).toBe(req.headers["x-real-port"]);
});

test("should return req.connection.remotePort", () => {
  const testPort = "443";

  const req = {
    connection: {
      remotePort: testPort,
    }
  };

  expect(port(req)).toBe(testPort);
});

test("should return req.connection.socket.remotePort", () => {
  const testPort = "443";

  const req = {
    connection: {
      socket: {
        remotePort: testPort,
      }
    }
  };

  expect(port(req)).toBe(testPort);
});

test("should return req.connection.socket.remotePort", () => {
  const testPort = "443";

  const req = {
    port: testPort,
  };

  expect(port(req)).toBe(testPort);
});

test("should return req.connection.socket.remotePort", () => {
  const testPort = "443";

  const req = {
    remotePort: testPort,
  };

  expect(port(req)).toBe(testPort);
});
