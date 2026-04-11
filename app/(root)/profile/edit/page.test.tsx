import { render, screen } from "@testing-library/react";
import React from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { authMock, getUserMock, redirectMock } = vi.hoisted(() => ({
  authMock: vi.fn(),
  getUserMock: vi.fn(),
  redirectMock: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  redirect: redirectMock,
}));

vi.mock("@/auth", () => ({
  auth: authMock,
}));

vi.mock("@/lib/actions/user.action", () => ({
  getUser: getUserMock,
}));

vi.mock("@/components/forms/ProfileForm", () => ({
  default: ({ user }: { user: { name: string } }) => (
    <div>{`profile-form:${user.name}`}</div>
  ),
}));

import EditProfilePage from "./page";

describe("app/(root)/profile/edit/page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("loads the edit profile page for an authenticated user", async () => {
    authMock.mockResolvedValue({ user: { id: "user-5" } });
    getUserMock.mockResolvedValue({
      success: true,
      data: {
        user: {
          _id: "user-5",
          name: "Aleksei Petrov",
        },
      },
    });

    const ui = await EditProfilePage();

    render(ui);

    expect(getUserMock).toHaveBeenCalledWith({ userId: "user-5" });
    expect(screen.getByText("Edit Profile")).toBeTruthy();
    expect(screen.getByText("profile-form:Aleksei Petrov")).toBeTruthy();
    expect(redirectMock).not.toHaveBeenCalled();
  });

  it("redirects guests to sign-in", async () => {
    const redirectError = new Error("redirected");
    redirectMock.mockImplementation(() => {
      throw redirectError;
    });
    authMock.mockResolvedValue(null);

    await expect(EditProfilePage()).rejects.toThrow(redirectError);
    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
    expect(getUserMock).not.toHaveBeenCalled();
  });

  it("redirects to sign-in when the user lookup fails", async () => {
    const redirectError = new Error("redirected");
    redirectMock.mockImplementation(() => {
      throw redirectError;
    });
    authMock.mockResolvedValue({ user: { id: "user-5" } });
    getUserMock.mockResolvedValue({
      success: false,
    });

    await expect(EditProfilePage()).rejects.toThrow(redirectError);
    expect(getUserMock).toHaveBeenCalledWith({ userId: "user-5" });
    expect(redirectMock).toHaveBeenCalledWith("/sign-in");
  });
});
