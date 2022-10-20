import { Display, BodyText, Icon, Button } from "@/components/design-system";
import { Progress } from "@/components/design-system/progress";
import { Pool } from "@/lib/graphql/generated";

type Props = {
  poolData: Partial<Pool>;
  tranchedPoolData: any;
};
function ArtistCancelPool({ poolData, tranchedPoolData }: Props) {
  let progressPercentage = 0;

  if (!tranchedPoolData.juniorDeposited.isZero()) {
    progressPercentage =
      (tranchedPoolData.juniorDeposited.toNumber() /
        tranchedPoolData.creditLine.maxLimit.toNumber()) *
      100;
  }

  const diffDays = Math.round(
    (new Date(poolData.closingDate ?? "").getTime() - Date.now()) /
      (1000 * 60 * 60 * 24)
  );

  return (
    <div className="rounded-lg border border-dark-90 p-6">
      <div className="flex justify-between">
        <Display className="text-accent-2" level={2}>
          ${tranchedPoolData.juniorDeposited.toNumber()}
        </Display>
        <BodyText size="large" className=" text-dark-50">
          of ${tranchedPoolData.creditLine.maxLimit.toNumber()}
        </BodyText>
      </div>
      <Progress percentage={progressPercentage} />
      <div className="mt-9 flex items-center">
        <Display level={2} className="text-white">
          {tranchedPoolData.numBackers ?? 0}
        </Display>
        <BodyText size="large" className="ml-4 text-dark-50">
          Backers
        </BodyText>
      </div>
      <div className="mt-8 flex items-center">
        <Display level={2} className="text-white">
          {diffDays}
        </Display>
        <BodyText size="large" className="ml-4 text-dark-50">
          Days left
        </BodyText>
      </div>
      <div className="flex items-center">
        <Icon size="md" name="Clock" />
        <BodyText size="large" className="ml-3 text-dark-50">
          Closing on
          {new Date(poolData.closingDate ?? "").toLocaleDateString("en-us", {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </BodyText>
      </div>
      <Button buttonType="tertiary" className="mx-auto mt-10 text-accent-3">
        Cancel Pool
      </Button>
    </div>
  );
}

export default ArtistCancelPool;
