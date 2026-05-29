import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll } from "vitest";
import { server } from "./msw/server";

// Polyfill: jsdom's File doesn't implement arrayBuffer() but Blob does.
// Real browsers and Node 20+ have it; jsdom inherits from Blob via prototype chain.
if (typeof File !== "undefined" && !File.prototype.arrayBuffer && Blob.prototype.arrayBuffer) {
  File.prototype.arrayBuffer = Blob.prototype.arrayBuffer;
}

beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());
