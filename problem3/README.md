# Problem 3: Messy React

Original code with short review comments. No extra components or source files.

```tsx
interface WalletBalance {
  // ISSUE:Missing file blockchain => add blockchain: string. The filter and sort below use this field.
  currency: string;
  amount: number;
}
interface FormattedWalletBalance {
  currency: string;
  amount: number;
  formatted: string;
}

interface Props extends BoxProps {
  // NOTE: This empty interface adds no fields. A type alias is enough.

}
const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  // ISSUE: children is never rendered. Render it or remove it from the props type.
  const balances = useWalletBalances();
  const prices = usePrices();

  const getPriority = (blockchain: any): number => {
    // ISSUE: any hides type errors. Use string and handle unknown chains.
    switch (blockchain) {
      case 'Osmosis':
        return 100
      case 'Ethereum':
        return 50
      case 'Arbitrum':
        return 30
      case 'Zilliqa':
        return 20
      case 'Neo':
        return 20
      default:
        return -99
    }
  }

  // NOTE: useMemo must stay inside a function component or a custom hook,
  // at the top level. Its position inside WalletPage is already correct.
  // Do not move it outside the component or call it inside an if or loop.
  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      // ISSUE: blockchain is missing from the WalletBalance type above.
      if (lhsPriority > -99) {
        // ERROR: lhsPriority is not defined. Use balancePriority.
        if (balance.amount <= 0) {
          // POLICY: This keeps zero and negative amounts.
          // If the wallet should show positive balances, use amount > 0.
          // Check Number.isFinite(amount) to reject invalid numbers.
          return true;
        }
      }
      return false
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
      // ISSUE: Equal priorities have no explicit return value. Return 0 here.
    });
  }, [balances, prices]);
  // ISSUE: This memo does not use prices. Price updates cause extra sorting.
  // Keep [balances] here, unless this memo also calculates USD values.
  // NOTE: filter creates a new array, so this sort does not change balances.

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    // ISSUE: This array is never used. The rows below map sortedBalances instead.
    return {
      ...balance,
      formatted: balance.amount.toFixed()
      // ISSUE: No precision means zero decimal places; 0.25 becomes "0".
      // Choose a display precision, such as up to 8 decimal places.
    }
  })

  const rows = sortedBalances.map((balance: FormattedWalletBalance, index: number) => {
    // ERROR: sortedBalances has no formatted field. Map formattedBalances instead.
    // Writing FormattedWalletBalance here does not add that field at runtime.
    const usdValue = prices[balance.currency] * balance.amount;
    // ISSUE: A missing price gives NaN. Check the price before multiplying.
    // Show "Price unavailable" for missing data; a valid zero price is different.
    // ISSUE: key={index} can point to a different row after sorting.
    // Use a stable position ID, or chain + currency if that pair is unique.
    return (
      <WalletRow
        className={classes.row}
        key={index}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    )
  })

  return (
    <div {...rest}>
      {/* ISSUE: BoxProps may include props that a native div cannot accept.
          Use the Box component, or use native div props for this component. */}
      {rows}
    </div>
  )
}
```

## Refactored version

Assumptions: balances contain valid amounts, the wallet shows positive balances on supported chains, and each blockchain/currency pair is unique. The hooks, `Box`, `BoxProps`, `WalletRow`, and `classes` are provided by the original project. `Box` is the component that matches `BoxProps`.

```tsx
interface WalletBalance {
  currency: string;
  amount: number;
  blockchain: string;
}

interface FormattedWalletBalance extends WalletBalance {
  formatted: string;
}

type Props = BoxProps;

const getPriority = (blockchain: string): number => {
  switch (blockchain) {
    case 'Osmosis':
      return 100;
    case 'Ethereum':
      return 50;
    case 'Arbitrum':
      return 30;
    case 'Zilliqa':
      return 20;
    case 'Neo':
      return 20;
    default:
      return -99;
  }
};

const WalletPage: React.FC<Props> = (props: Props) => {
  const { children, ...rest } = props;
  const balances = useWalletBalances();
  const prices = usePrices();

  // NOTE: useMemo must stay inside a function component or a custom hook,
  // at the top level. Its position inside WalletPage is already correct.
  // Do not move it outside the component or call it inside an if or loop.
  const sortedBalances = useMemo(() => {
    return balances.filter((balance: WalletBalance) => {
      const balancePriority = getPriority(balance.blockchain);
      return balancePriority > -99 && balance.amount > 0;
    }).sort((lhs: WalletBalance, rhs: WalletBalance) => {
      const leftPriority = getPriority(lhs.blockchain);
      const rightPriority = getPriority(rhs.blockchain);
      if (leftPriority > rightPriority) {
        return -1;
      } else if (rightPriority > leftPriority) {
        return 1;
      }
      return 0;
    });
  }, [balances]);

  const formattedBalances = sortedBalances.map((balance: WalletBalance) => {
    return {
      ...balance,
      formatted: balance.amount.toFixed(8),
    };
  });

  const rows = formattedBalances.map((balance: FormattedWalletBalance) => {
    const price = prices[balance.currency];

    if (price == null) {
      return (
        <p key={`${balance.blockchain}:${balance.currency}`}>
          {balance.currency}: {balance.formatted} · Price unavailable
        </p>
      );
    }

    const usdValue = price * balance.amount;
    return (
      <WalletRow
        className={classes.row}
        key={`${balance.blockchain}:${balance.currency}`}
        amount={balance.amount}
        usdValue={usdValue}
        formattedAmount={balance.formatted}
      />
    );
  });

  return (
    <Box {...rest}>
      {rows}
      {children}
    </Box>
  );
};
```

This keeps the original filter → sort → format → render flow. The fixes add the missing field, use the correct priority variable, keep positive amounts, return 0 for equal priorities, remove the unused price dependency, render formatted data, set decimal places, handle missing prices, use stable keys and render children. The priority helper sits outside the component because it does not use props or state. Eight decimal places is a display choice; multiple positions with the same chain/currency need a stable position ID.
