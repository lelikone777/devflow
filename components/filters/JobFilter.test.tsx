import { fireEvent, render, screen } from "@testing-library/react";
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const {
  useUrlQueryMock,
  pushQueryParamMock,
  getParamMock,
  useTranslationsMock,
} = vi.hoisted(() => ({
  useUrlQueryMock: vi.fn(),
  pushQueryParamMock: vi.fn(),
  getParamMock: vi.fn(),
  useTranslationsMock: vi.fn(),
}));

vi.mock("@/hooks/use-url-query", () => ({
  useUrlQuery: useUrlQueryMock,
}));

vi.mock("@/context/Language", () => ({
  useTranslations: useTranslationsMock,
}));

vi.mock("next/image", () => ({
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img alt={props.alt ?? ""} {...props} />
  ),
}));

vi.mock("../search/LocalSearch", () => ({
  default: () => <div>local-search</div>,
}));

vi.mock("@/components/ui/select", async () => {
  const React = await import("react");
  const SelectContext = React.createContext<
    | {
        onValueChange?: (value: string) => void;
        disabled?: boolean;
      }
    | undefined
  >(undefined);

  const Select = ({
    children,
    onValueChange,
    disabled,
  }: {
    children: React.ReactNode;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
  }) => (
    <SelectContext.Provider value={{ onValueChange, disabled }}>
      <div>{children}</div>
    </SelectContext.Provider>
  );

  const SelectTrigger = ({
    children,
    disabled,
  }: {
    children: React.ReactNode;
    disabled?: boolean;
  }) => <button disabled={disabled}>{children}</button>;

  const SelectValue = ({ placeholder }: { placeholder: string }) => (
    <span>{placeholder}</span>
  );

  const SelectContent = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );

  const SelectGroup = ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  );

  const SelectItem = ({
    children,
    value,
  }: {
    children: React.ReactNode;
    value: string;
  }) => {
    const context = React.useContext(SelectContext);

    return (
      <button
        onClick={() => context?.onValueChange?.(value)}
        disabled={context?.disabled}
      >
        {children}
      </button>
    );
  };

  return {
    Select,
    SelectTrigger,
    SelectValue,
    SelectContent,
    SelectGroup,
    SelectItem,
  };
});

import JobsFilter from "./JobFilter";

describe("components/filters/JobFilter", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();

    useTranslationsMock.mockReturnValue((key: string) => key);
    getParamMock.mockImplementation((key: string, fallback = "") => {
      const values: Record<string, string> = {
        location: "",
        datePosted: "all",
        remote: "any",
        employmentType: "any",
        requirement: "any",
        radius: "any",
      };

      return values[key] ?? fallback;
    });

    useUrlQueryMock.mockReturnValue({
      pathname: "/jobs",
      getParam: getParamMock,
      pushQueryParam: pushQueryParamMock,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("pushes the typed location after debounce", () => {
    render(<JobsFilter />);

    fireEvent.change(screen.getByPlaceholderText("jobs.locationPlaceholder"), {
      target: { value: "Moscow" },
    });

    vi.advanceTimersByTime(300);

    expect(pushQueryParamMock).toHaveBeenCalledWith("location", "Moscow");
  });

  it("updates remote mode through query params", () => {
    render(<JobsFilter />);

    fireEvent.click(screen.getByRole("button", { name: "Remote only" }));

    expect(pushQueryParamMock).toHaveBeenCalledWith("remote", "remote", {
      removeIfEmpty: true,
    });
  });

  it("keeps the country selector disabled", () => {
    render(<JobsFilter />);

    const disabledButtons = screen.getAllByRole("button").filter((button) =>
      button.hasAttribute("disabled")
    );

    expect(disabledButtons.length).toBeGreaterThan(0);
  });
});
