import { CancelledError } from "../async_action_runner";
import { WeakPromise } from "../weak_promise";

describe("WeakPromise", () => {
  test("Happy Path", async () => {
    let cancelled = false;

    const p = new WeakPromise((resolve, reject) => {
      return () => {
        cancelled = true;
      };
    });
    setTimeout(() => {
      p.cancel(new Error("Stopped"));
    }, 0);

    try {
      await p;
    } catch (e) {
      expect(e.message).toBe("Stopped");
    }

    expect(cancelled).toBe(true);
  });

});