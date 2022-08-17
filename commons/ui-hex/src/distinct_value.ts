import { ObservableValue } from "./observable_value";

const defaultCompareFunction = (o: unknown, n: unknown) => o === n;

export class DistinctValue<T, TError = unknown> extends ObservableValue<
  T,
  TError
> {
  private compareFunction: (oldValue: T, newValue: T) => boolean;

  constructor(
    initialValue: T,
    equalityOperator: (
      oldValue: T,
      newValue: T
    ) => boolean = defaultCompareFunction
  ) {
    super(initialValue);
    this.compareFunction = equalityOperator;
  }

  setValue(value: T) {
    if (!this.compareFunction(this._value, value)) {
      super.setValue(value);
      return true;
    }
    return false;
  }
}
