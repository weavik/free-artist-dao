import { BigNumber } from "ethers";
import { useRouter } from "next/router";
import { useEffect } from "react";

import { PoolCard } from "@/components/dashboard/pool-card";
import {
  Heading,
  Caption,
  Link,
  Tooltip,
  Icon,
} from "@/components/design-system";
import { SupportedCrypto } from "@/lib/graphql/generated";

type Props = {
  openPoolData: any[];
  setEarnedAndRaisedAmount: (
    earnedAmount: number,
    raisedAmount: number
  ) => void;
};

const ToolTipInformation = () => (
  <div className="max-w-xs">
    <div className="mb-4 text-xl font-bold text-dark-80">
      How do I collect revenue?
    </div>
    <div>
      Collect revenue by claiming USDC with your token, when revenue is
      announced. View step-by-step here&nbsp;
      <Link
        href={
          "https://drive.google.com/file/d/1K0CAAACatYbfRkx4IRMwYa1ZNg9_RAf0/view"
        }
      >
        here
      </Link>
    </div>
  </div>
);

function DashboardArtistPool({
  openPoolData,
  setEarnedAndRaisedAmount,
}: Props) {
  const router = useRouter();

  useEffect(() => {
    let totalRaised = 0;
    if (openPoolData) {
      (openPoolData ?? []).forEach((tranchedPool: any) => {
        totalRaised += BigNumber.from(
          tranchedPool?.juniorDeposited ?? BigNumber.from(0)
        ).toNumber();
      });
    }
    setEarnedAndRaisedAmount(0, totalRaised);
  }, [openPoolData, setEarnedAndRaisedAmount]);

  const handleClick = (poolAddress: string) => {
    router.push(`/artist/pool/${poolAddress}`);
  };

  return (
    <>
      <div className="mb-5 mt-10 flex">
        <Heading className="flex w-96 text-white" level={5} medium={true}>
          <Tooltip placement="bottom-start" content={<ToolTipInformation />}>
            <button>
              My Open Pools
              <Icon name="InfoCircleOutlined" className="ml-2" />
            </button>
          </Tooltip>
        </Heading>
        <Caption className="mr-11 w-60 flex-1 pt-3 text-right text-light-40">
          Progress
        </Caption>
      </div>
      {openPoolData
        ? openPoolData.map((tranchedPool: any) => (
            <PoolCard
              key={tranchedPool.id}
              className="mb-10"
              poolName={tranchedPool.poolName}
              totalSuppliedAmount={{
                token: SupportedCrypto.Usdc,
                amount: BigNumber.from(
                  tranchedPool?.juniorDeposited ?? BigNumber.from(0)
                ),
              }}
              totalGoalAmount={{
                token: SupportedCrypto.Usdc,
                amount: tranchedPool.creditLine?.maxLimit ?? BigNumber.from(0), //90% - not sure if this is the correct field
              }}
              artistName={tranchedPool.walletAddress}
              image={""}
              onClick={() => handleClick(tranchedPool.id)}
            />
          ))
        : null}
      <div className="mb-5 mt-10 flex">
        <Heading className="w-96 flex-1 text-white" level={5}>
          My Closed Pools
        </Heading>
        <Caption className="ml-32 flex-1 text-center">Total Earned</Caption>
        <Caption className="flex-1 text-center">Status</Caption>
        <Caption className="mr-11 w-60 flex-none text-right">Progress</Caption>
      </div>

      {/* TODO - once we integrate GraphQL/Smart Contracts */}
      {/* <PoolCard
        key={tranchedPool.id}
        className="mb-10"
        artistName={tranchedPool.artist}
        poolName={tranchedPool.name}
        image="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAABx2SURBVHgBxZ1nbFzF2scnsYHQFwgQapbeiemhr+k9vpQoINB1ECCFL7EFSFcCKbaEeMMXsL8AryISh35BwjYgCNVLJ9QktFACG2ropie03Oc32f/q8eSsS+LASEdn95w5c575P/2ZWXtE+AdbT09Pbp111in89ddf+dra2nEjR47ML1++PM89PpfP8RgxYkSvHSX7HM92LLbPxVGjRs3bYYcdesM/1EaEv7EBWE1NTYHDvk4oAwc48TDwKp8BjeYAjN/t2T73aTZO6ffffy+uu+663WuvvXbx7wT0bwHQgCvYxKYaQAWbfE5gcQCIB0gA6jv36KOWAqqx9Ll87vjzzz+799xzz66whtsaAxBpA7Q//vijCdAkOR4cm2RFojxIHjya+gCUJNZLIN9NCsMPP/wQ7zPusmXLwkYbbVSyZ1tR9T322KMU1kAbdgA7OztzRvhUm1STEZ7zAHnwvOSk4HmAPOgaR1IIUAD31VdfhSeeeCJ88MEHwZgWfvzxx3DQQQeFU045Jay11lq8p2RDdey2226tYZhbbRjGZuA12gSmmdTlmSzSIHAEioCR+gIAh++nJlXlsDFjv59++in8+uuv8Xj33XfDL7/8EgF84403Yh+e2WqrrcKmm25aYZo16Gl5/vnnG2fMmNE6c+bMjjBMbVgAnDVrVt4M+CybQIHvAiQLxNRhpNLHdYGKhL333nvh+++/j9L12WefhS+++CKYbYvj0l577bWwzTbbhM022yx8/vnn4bfffgtLly4Nvb29lXeobbLJJvl999131nnnnTfhrbfeap43b14prGZbbQBvvfVWnEOLER2dAyrDoQmWVWgluybpAig5lPfffz988skncfI///xzBG277baLwHz33Xfh22+/DeZhw8Ybbxw+/PDDsOuuu0YwzQNHcFFfJBJJ5MzYepeYuuOOO4ZSqdRgR8HUvPmll17qCKvRasIqtnw+n7v66qv/D9Uwro9iEnBfYIhwHQAq6eI7KohkzZ07N8yfPz8sWrQo3HnnnWHhwoVx8iYd0RFgzzjvv//+USJR1w022CCq6E477RSvAR5SRz/OjG/xYRg/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"
        totalSuppliedAmount={{
          token: SupportedCrypto.Usdc,
          amount: tranchedPool?.juniorTranches[0].principalDeposited,
        }}
        totalGoalAmount={{
          token: SupportedCrypto.Usdc,
          amount: tranchedPool.creditLine.maxLimit, //90% - not sure if this is the correct field
        }}
        type={
          (tranchedPool?.juniorTranches[0].principalDeposited as BigNumber).gte(
            tranchedPool.creditLine.maxLimit
          )
            ? "completed"
            : "failed"
        }
      /> */}
    </>
  );
}

export default DashboardArtistPool;
