import { useQuery } from "@apollo/client";
import { useEffect } from "react";

import {
  Button,
  ButtonProps,
  ButtonType,
  Link,
  Tooltip,
} from "@/components/design-system";
import { DESIRED_CHAIN_ID } from "@/constants";
import { useSetUser } from "@/hooks/user-hooks";
import { handleAddressFormat } from "@/lib/format/common";
import { useWallet } from "@/lib/wallet";
import { metaMask, metaMaskHooks } from "@/lib/wallet/connectors/metamask";
import { accountQuery } from "@/queries/user.queries";

type Props = {
  className?: string;
};

enum ButtonStates {
  CONNECT = "Connect Wallet",
  CONNECTING = "Processing...",
  INSTALL_METAMASK = "Install MetaMask",
  WRONG_NETWORK = "Wrong Network",
  ERROR = "Error",
}

type IWalletButton = Pick<
  ButtonProps,
  "onClick" | "isLoading" | "iconLeft" | "buttonType" | "className" | "children"
>;

const ToolTipInformation = () => (
  <div className="max-w-xs">
    <div className="mb-4 text-xl font-bold text-dark-80">
      Why do I need a wallet?
    </div>
    <div>
      Your wallet allows interaction on blockchain, which is needed to
      co-ordinate revenue distribution at a high volume. Learn how to set it
      up&nbsp;
      <Link
        target={"_blank"}
        href={
          "https://drive.google.com/file/d/1K0CAAACatYbfRkx4IRMwYa1ZNg9_RAf0/view"
        }
      >
        here
      </Link>
    </div>
  </div>
);

export function WalletButton({ className }: Props) {
  const { account } = useWallet();
  const isActivating = metaMaskHooks.useIsActivating();
  const error = metaMaskHooks.useError();

  const setUser = useSetUser();

  const { data } = useQuery(accountQuery, {
    variables: {
      userAccount: account?.toLowerCase(),
      fetchPolicy: "network-only",
    },
  });

  const handleConnectMetaMask = () => {
    metaMask.activate(DESIRED_CHAIN_ID);
  };

  useEffect(() => {
    if (data?.user) {
      setUser && setUser(data.user);
    }
  }, [data, setUser]);

  const getButton = (): IWalletButton => {
    if (error) {
      return {
        iconLeft: "Exclamation",
        buttonType: ButtonType.PRIMARY,
        children:
          error.name === "ChainIdNotAllowedError"
            ? ButtonStates.WRONG_NETWORK
            : ButtonStates.ERROR,
        onClick: handleConnectMetaMask,
      };
    }
    if (isActivating) {
      return {
        buttonType: ButtonType.PRIMARY,
        children: ButtonStates.CONNECTING,
      };
    }
    if (account) {
      return {
        iconLeft: "Wallet",
        buttonType: ButtonType.SECONDARY,
        children: handleAddressFormat(account),
      };
    }
    return {
      buttonType: ButtonType.PRIMARY,
      onClick: handleConnectMetaMask,
      children: ButtonStates.CONNECT,
    };
  };

  const button = <Button {...getButton()} className={className} />;

  return error?.message ? (
    <Tooltip content={error.message}>{button}</Tooltip>
  ) : !account ? (
    <Tooltip content={<ToolTipInformation />}>{button}</Tooltip>
  ) : (
    button
  );
}
