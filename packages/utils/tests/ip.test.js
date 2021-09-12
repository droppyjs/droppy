const ip = require("../lib/ip");

test("should return x-forwarded-for", () => {
  const req = {
    headers: {
      "x-forwarded-for": "10.0.1.5",
    }
  };

  expect(ip(req)).toBe(req.headers["x-forwarded-for"]);
});

test("should return x-forwarded-for index item 0", () => {
  const firstIP = "10.0.1.2";

  const req = {
    headers: {
      "x-forwarded-for": `${firstIP},10.0.1.3,10.0.1.4`,
    }
  };

  expect(ip(req)).toBe(firstIP);
});

test("should return x-real-ip", () => {
  const req = {
    headers: {
      "x-real-ip": "10.0.1.7",
    }
  };

  expect(ip(req)).toBe(req.headers["x-real-ip"]);
});

test("should return connection.remoteAddress", () => {
  const req = {
    connection: {
      remoteAddress: "10.0.1.8",
    }
  };

  expect(ip(req)).toBe(req.connection.remoteAddress);
});

test("should return req.connection.socket.remoteAddress", () => {
  const req = {
    connection: {
      socket: {
        remoteAddress: "10.0.1.9",
      }
    }
  };

  expect(ip(req)).toBe(req.connection.socket.remoteAddress);
});

test("should return req.addr", () => {
  const req = {
    addr: "10.0.1.10",
  };

  expect(ip(req)).toBe(req.addr);
});

test("should return req.remoteAddress", () => {
  const req = {
    remoteAddress: "10.0.1.11",
  };

  expect(ip(req)).toBe(req.remoteAddress);
});

test("should return undefined", () => {
  const req = {
    invalidPayload: "10.0.1.12",
  };

  expect(ip(req)).toBe(undefined);
});
