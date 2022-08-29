import { Tab as HeadlessUiTab } from "@headlessui/react";
import clsx from "clsx";
import { Fragment } from "react";
import { ReactNode } from "react";

type TabProps = { children: ReactNode };

export function Tab({ children }: TabProps) {
  return (
    <HeadlessUiTab as={Fragment}>
      {({ selected }) => (
        <button
          className={clsx(
            "border-b-2 text-lg font-medium",
            selected ? "border-b-sand-700" : "border-transparent opacity-50"
          )}
        >
          {children}
        </button>
      )}
    </HeadlessUiTab>
  );
}

function TabList({ children }: { children: ReactNode }) {
  return (
    <HeadlessUiTab.List className="flex gap-6">{children}</HeadlessUiTab.List>
  );
}

function TabPanel({ children }: { children: ReactNode }) {
  return <HeadlessUiTab.Panel className="mt-8">{children}</HeadlessUiTab.Panel>;
}

function TabGroup({ children }: { children: ReactNode }) {
  return (
    <div className="relative z-10">
      {/* The z-10 here keeps the Tab group sitting above the card background. Good because otherwise clicking the card background causes the card to collapse */}
      <HeadlessUiTab.Group>{children}</HeadlessUiTab.Group>
    </div>
  );
}

Tab.Group = TabGroup;
Tab.List = TabList;
Tab.Panels = HeadlessUiTab.Panels;
Tab.Panel = TabPanel;
