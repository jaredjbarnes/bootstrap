import { AsyncActionRunner, Status } from "../async_action_runner";
import { WeakPromise } from "../weak_promise";

describe("AsyncActionRunner", () => {
  test("Success", async () => {
    const statuses: Status[] = [];
    const runner = new AsyncActionRunner(0);

    runner.status.onChange((status) => {
      statuses.push(status);
    });

    const value = await runner.execute(() => {
      return WeakPromise.resolve(1);
    });

    expect(runner.getValue()).toBe(1);
    expect(value).toBe(runner.getValue());
    expect(runner.getError()).toBe(null);
    expect(statuses.join("|")).toBe("pending|success");
  });

  test("Error", async () => {
    const statuses: Status[] = [];
    const runner = new AsyncActionRunner(0);
    const error = new Error("Bad");

    runner.status.onChange((status) => {
      statuses.push(status);
    });

    try {
      await runner.execute(() => {
        return WeakPromise.reject(error);
      });
    } catch (error) {
      expect(runner.getValue()).toBe(0);
      expect(runner.getError()).toBe(error);
      expect(statuses.join("|")).toBe("pending|error");
    }
  });

  test("Reset", async () => {
    const statuses: Status[] = [];
    const runner = new AsyncActionRunner(0);
    const error = new Error("Bad");

    runner.status.onChange((status) => {
      statuses.push(status);
    });

    try {
      await runner.execute(() => {
        return WeakPromise.reject(error);
      });
    } catch (error) {
      expect(runner.getValue()).toBe(0);
      expect(runner.getError()).toBe(error);
      expect(statuses.join("|")).toBe("pending|error");

      runner.setValue(5);
      expect(runner.getValue()).toBe(5);

      runner.reset();
      expect(runner.getValue()).toBe(0);
      expect(runner.getError()).toBe(null);
      expect(runner.status.getValue()).toBe("initial");
    }
  });

  test("Retry", async () => {
    await new Promise((resolve) => {
      const statuses: Status[] = [];
      let count = 0;
      const runner = new AsyncActionRunner(0);
      const error = new Error("Bad");

      runner.status.onChange((status) => {
        statuses.push(status);

        if (status === Status.SUCCESS) {
          expect(statuses.join("|")).toBe(
            "pending|error|initial|pending|success"
          );
          expect(runner.getValue()).toBe(1);
          resolve(undefined);
        }
      });

      runner
        .execute(() => {
          if (count === 0) {
            count++;
            return WeakPromise.reject(error);
          } else {
            return WeakPromise.resolve(1);
          }
        })
        .catch(() => {
          expect(runner.getValue()).toBe(0);
          expect(runner.getError()).toBe(error);
          expect(statuses.join("|")).toBe("pending|error");

          const executingAction = runner.retry();
          expect(executingAction).toBeInstanceOf(Promise);
        });
    });
  });

  test("Dispose", () => {
    const runner = new AsyncActionRunner(0);
    expect(runner.getValue()).toBe(0);
    runner.dispose();
  });

  test("Multiple executions.", async () => {
    const runner = new AsyncActionRunner(0);

    const action = () => {
      return WeakPromise.resolve(runner.getValue() + 1);
    };

    let value = await runner.execute(action);
    expect(value).toBe(1);
    value = await runner.execute(action);
    expect(value).toBe(2);
  });

  test("Cancel.", async () => {
    const runner = new AsyncActionRunner(0);
    let isCancelled = false;
    const action = () => {
      return new WeakPromise<number>((resolve) => {
        window.setTimeout(resolve, 1, 1);
        return () => {
          isCancelled = true;
        };
      });
    };

    try {
      const value = await runner.execute(action);
      runner.cancel();
    } catch (error) {
      expect(error?.message).toBe("Cancelled");
    }
  });

  test("Execute when in error state.", async () => {
    const runner = new AsyncActionRunner(0);
    const action = () => {
      return new WeakPromise<number>((resolve) => {
        window.setTimeout(resolve, 1, 1);
        return () => {};
      });
    };

    let value: number = runner.getValue();

    try {
      value = await runner.execute(action);
    } catch (error) {
      expect(error).toBe("Bad News");
      try {
        value = await runner.execute(action);
      } catch (error) {}
    }

    expect(value).toBe(1);
  });

  test("AsyncActionRunner set value directly.", () => {
    const runner = new AsyncActionRunner(0);

    runner.setValue(1);
    expect(runner.getValue()).toBe(1);
  });
});
