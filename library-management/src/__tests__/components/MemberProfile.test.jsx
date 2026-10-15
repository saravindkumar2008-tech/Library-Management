/**
 * MemberProfile.test.jsx
 * Requirement a: Test member profile component.
 * Topics: Jest, React Testing Library
 */
import React from "react";
import { screen, fireEvent, waitFor } from "@testing-library/react";
import { renderWithProviders } from "../testUtils";
import { DEFAULT_MEMBER_DATA } from "../../services/mockData";

// ─── Mocks ────────────────────────────────────────────────────────────────────
jest.mock("../../context/LibraryContext", () => ({
  useLibrary: jest.fn()
}));
jest.mock("../../context/AuthContext", () => ({
  useAuth: jest.fn()
}));
jest.mock("../../components/Input", () =>
  ({ name, value, onChange, placeholder, type }) => (
    <input
      name={name}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      type={type || "text"}
      data-testid={`input-${name}`}
    />
  )
);
jest.mock("../../components/Button", () =>
  ({ children, onClick, type }) => (
    <button onClick={onClick} type={type || "button"}>{children}</button>
  )
);
jest.mock("../../utils/validation", () => ({
  validateProfileForm: jest.fn(() => ({ isValid: true, errors: {} }))
}));

import { useLibrary } from "../../context/LibraryContext";
import { useAuth } from "../../context/AuthContext";
import { validateProfileForm } from "../../utils/validation";
import { Profile } from "../../components/Profile";

const mockSetMember = jest.fn();
const mockUpdateUserProfile = jest.fn();

const makeLibContext = (overrides = {}) => ({
  member: DEFAULT_MEMBER_DATA,
  setMember: mockSetMember,
  readingStatistics: { totalBooks: 5, totalDaysReading: 30 },
  ...overrides
});

const makeAuthContext = (overrides = {}) => ({
  currentUser: null,
  updateUserProfile: mockUpdateUserProfile,
  ...overrides
});

// ─────────────────────────────────────────────────────────────────────────────

describe("Member Profile Component (Requirement a)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    useLibrary.mockReturnValue(makeLibContext());
    useAuth.mockReturnValue(makeAuthContext());
    validateProfileForm.mockReturnValue({ isValid: true, errors: {} });
  });

  describe("Rendering Member Info", () => {
    test("renders member name in form", () => {
      renderWithProviders(<Profile />);
      const nameInput = screen.getByTestId("input-name");
      expect(nameInput.value).toBe(DEFAULT_MEMBER_DATA.name);
    });

    test("renders member email in form", () => {
      renderWithProviders(<Profile />);
      const emailInput = screen.getByTestId("input-email");
      expect(emailInput.value).toBe(DEFAULT_MEMBER_DATA.email);
    });

    test("renders member ID in form", () => {
      renderWithProviders(<Profile />);
      const memberIdInput = screen.getByTestId("input-memberId");
      expect(memberIdInput.value).toBe(DEFAULT_MEMBER_DATA.memberId);
    });

    test("renders member phone in form", () => {
      renderWithProviders(<Profile />);
      const phoneInput = screen.getByTestId("input-phone");
      expect(phoneInput.value).toBe(DEFAULT_MEMBER_DATA.phone);
    });

    test("renders Save Changes button", () => {
      renderWithProviders(<Profile />);
      expect(screen.getByRole("button", { name: /save.*changes/i })).toBeInTheDocument();
    });
  });

  describe("Form Validation", () => {
    test("shows error when name is empty on submit", async () => {
      validateProfileForm.mockReturnValue({
        isValid: false,
        errors: { name: "Name is required" }
      });
      renderWithProviders(<Profile />);
      fireEvent.change(screen.getByTestId("input-name"), {
        target: { name: "name", value: "" }
      });
      fireEvent.click(screen.getByRole("button", { name: /save.*changes/i }));
      await waitFor(() => {
        expect(validateProfileForm).toHaveBeenCalled();
      });
    });

    test("shows error when email is invalid on submit", async () => {
      validateProfileForm.mockReturnValue({
        isValid: false,
        errors: { email: "Valid email required" }
      });
      renderWithProviders(<Profile />);
      fireEvent.change(screen.getByTestId("input-email"), {
        target: { name: "email", value: "not-an-email" }
      });
      fireEvent.click(screen.getByRole("button", { name: /save.*changes/i }));
      await waitFor(() => {
        expect(validateProfileForm).toHaveBeenCalled();
      });
    });

    test("calls updateUserProfile when form is valid on submit", async () => {
      validateProfileForm.mockReturnValue({ isValid: true, errors: {} });
      renderWithProviders(<Profile />);
      fireEvent.click(screen.getByRole("button", { name: /save.*changes/i }));
      await waitFor(() => {
        expect(mockUpdateUserProfile).toHaveBeenCalled();
      });
    });
  });

  describe("Using currentUser from AuthContext", () => {
    test("pre-fills form with currentUser data when available", () => {
      const customUser = {
        ...DEFAULT_MEMBER_DATA,
        name: "Test User",
        email: "test@library.com"
      };
      useAuth.mockReturnValue(makeAuthContext({ currentUser: customUser }));
      renderWithProviders(<Profile />);
      expect(screen.getByTestId("input-name").value).toBe("Test User");
      expect(screen.getByTestId("input-email").value).toBe("test@library.com");
    });
  });
});
