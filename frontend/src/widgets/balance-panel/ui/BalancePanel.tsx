import type { User } from '../../../entities/user/model/types';
import { Button } from '../../../shared/ui/Button';
import { Card } from '../../../shared/ui/Card';
import { TextField } from '../../../shared/ui/TextField';

interface BalancePanelProps {
  me: User | null;
  toUserId: string;
  amount: string;
  loading: boolean;
  isAuthorized: boolean;
  onToUserIdChange: (value: string) => void;
  onAmountChange: (value: string) => void;
  onTransfer: () => void;
  onResetBalances: () => void;
}

export function BalancePanel({
  me,
  toUserId,
  amount,
  loading,
  isAuthorized,
  onToUserIdChange,
  onAmountChange,
  onTransfer,
  onResetBalances,
}: BalancePanelProps) {
  return (
    <Card>
      <h2 className="text-2xl font-bold">Balance and transfers</h2>
      <p className="mt-2 text-sm text-slate-400">
        Transfer uses a database transaction: debit and credit happen atomically.
      </p>

      <div className="mt-5 rounded-2xl bg-slate-950/50 p-4">
        <p className="text-sm text-slate-400">My balance</p>
        <p className="mt-1 text-3xl font-black text-emerald-300">
          ${me?.balance ?? '0.00'}
        </p>
      </div>

      <div className="mt-5 space-y-4">
        <TextField
          label="Receiver user ID"
          placeholder="uuid of another user"
          value={toUserId}
          onChange={onToUserIdChange}
        />
        <TextField
          label="Amount"
          placeholder="20.51"
          value={amount}
          onChange={onAmountChange}
        />
        <div className="flex flex-col gap-3 sm:flex-row">
          <Button disabled={loading || !isAuthorized} onClick={onTransfer}>
            Transfer
          </Button>
          <Button
            variant="danger"
            disabled={loading || !isAuthorized}
            onClick={onResetBalances}
          >
            Reset all balances
          </Button>
        </div>
      </div>
    </Card>
  );
}
