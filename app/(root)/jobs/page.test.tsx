import { render, screen } from "@testing-library/react";
import React from "react";
import { describe, expect, it, vi } from "vitest";

const { fetchJobsMock, getServerTranslatorMock } = vi.hoisted(() => ({
  fetchJobsMock: vi.fn(),
  getServerTranslatorMock: vi.fn(),
}));

vi.mock("@/lib/actions/job.action", () => ({
  fetchJobs: fetchJobsMock,
}));

vi.mock("@/lib/i18n-server", () => ({
  getServerTranslator: getServerTranslatorMock,
}));

vi.mock("@/components/filters/JobFilter", () => ({
  default: () => <div>jobs-filter</div>,
}));

vi.mock("@/components/cards/JobCard", () => ({
  default: ({ job }: { job: { job_title: string } }) => <div>{job.job_title}</div>,
}));

vi.mock("@/components/Pagination", () => ({
  default: ({
    page,
    isNext,
  }: {
    page: number | string;
    isNext?: boolean;
  }) => <div>{`jobs-pagination:${String(page)}:${String(isNext)}`}</div>,
}));

import JobsPage from "./page";

describe("app/(root)/jobs/page", () => {
  it("builds fetch params from search params and renders job results", async () => {
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
      locale: "ru",
    });
    fetchJobsMock.mockResolvedValue([
      { job_id: "job-1", job_title: "Senior Frontend Engineer" },
      { job_id: "job-2", job_title: "React Developer" },
    ]);

    const ui = await JobsPage({
      searchParams: Promise.resolve({
        query: "frontend",
        location: "Berlin",
        datePosted: "week",
        remote: "remote",
        employmentType: "FULLTIME",
        requirement: "no_degree",
        radius: "25",
        page: "2",
      }),
    } as never);

    render(ui);

    expect(fetchJobsMock).toHaveBeenCalledWith({
      query: "frontend jobs in Berlin",
      page: "2",
      country: "us",
      location: "Berlin",
      datePosted: "week",
      workFromHome: true,
      employmentTypes: "FULLTIME",
      jobRequirements: "no_degree",
      radius: "25",
      language: "ru",
    });
    expect(screen.getByText("jobs-filter")).toBeTruthy();
    expect(screen.getByText("Senior Frontend Engineer")).toBeTruthy();
    expect(screen.getByText("React Developer")).toBeTruthy();
    expect(screen.getByText("jobs-pagination:2:false")).toBeTruthy();
  });

  it("renders the empty state when no jobs are returned", async () => {
    getServerTranslatorMock.mockResolvedValue({
      t: (key: string) => key,
      locale: "ru",
    });
    fetchJobsMock.mockResolvedValue([]);

    const ui = await JobsPage({
      searchParams: Promise.resolve({}),
    } as never);

    render(ui);

    expect(fetchJobsMock).toHaveBeenCalledWith({
      query: "Software Engineer jobs",
      page: 1,
      country: "us",
      location: undefined,
      datePosted: "all",
      workFromHome: undefined,
      employmentTypes: undefined,
      jobRequirements: undefined,
      radius: undefined,
      language: "ru",
    });
    expect(screen.getByText("jobs.empty")).toBeTruthy();
    expect(screen.queryByText(/jobs-pagination:/)).toBeNull();
  });
});
