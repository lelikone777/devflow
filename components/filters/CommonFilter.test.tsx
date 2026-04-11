import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { getParamMock, pushQueryParamMock } = vi.hoisted(() => ({
  getParamMock: vi.fn(),
  pushQueryParamMock: vi.fn(),
}));

vi.mock("@/hooks/use-url-query", () => ({
  useUrlQuery: () => ({
    getParam: getParamMock,
    pushQueryParam: pushQueryParamMock,
  }),
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");
  const SelectContext = React.createContext<
    ((value: string) => void) | undefined
  >(undefined);

  const Select = ({
    children,
    onValueChange,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
  }) => (
    <SelectContext.Provider value={onValueChange}>
      <div data-testid="select-root">{children}</div>
    </SelectContext.Provider>
  );

  return {
    Select,
    SelectTrigger: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SelectValue: ({ placeholder }: { placeholder: string }) => (
      <span>{placeholder}</span>
    ),
    SelectContent: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SelectGroup: ({ children }: { children: React.ReactNode }) => (
      <div>{children}</div>
    ),
    SelectItem: ({
      children,
      value,
    }: {
      children: React.ReactNode;
      value: string;
    }) => {
      const onValueChange = React.useContext(SelectContext);

      return <button onClick={() => onValueChange?.(value)}>{children}</button>;
    },
  };
});

import CommonFilter from "./CommonFilter";

describe("components/filters/CommonFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getParamMock.mockReturnValue("newest");
  });

  it("pushes the selected filter into the query params", () => {
    render(
      <CommonFilter
        filters={[
          { name: "Newest", value: "newest" },
          { name: "Popular", value: "popular" },
        ]}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Популярные" }));

    expect(pushQueryParamMock).toHaveBeenCalledWith("filter", "popular");
  });
});
