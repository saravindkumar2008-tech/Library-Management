import React, { useState, useEffect } from "react";
import { useLibrary } from "../context/LibraryContext";
import { useAuth } from "../context/AuthContext";
import Input from "./Input";
import Button from "./Button";
import { validateProfileForm } from "../utils/validation";

/**
 * Profile Component
 * Form Validation for: Required fields, Email, Phone, Member ID, and Profile info.
 */
export function Profile() {
  const { member, setMember, readingStatistics } = useLibrary();
  const { currentUser, updateUserProfile } = useAuth();

  const activeUser = currentUser || member;

  const [formData, setFormData] = useState({
    name: activeUser?.name || "",
    email: activeUser?.email || "",
    memberId: activeUser?.memberId || "",
    phone: activeUser?.phone || "",
    branch: activeUser?.branch || "AK Central Library, Chennai",
    membershipTier: activeUser?.membershipTier || "Gold Scholar"
  });

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [savedMessage, setSavedMessage] = useState(false);

  useEffect(() => {
    if (activeUser) {
      setFormData({
        name: activeUser.name || "",
        email: activeUser.email || "",
        memberId: activeUser.memberId || "",
        phone: activeUser.phone || "",
        branch: activeUser.branch || "AK Central Library, Chennai",
        membershipTier: activeUser.membershipTier || "Gold Scholar"
      });
    }
  }, [activeUser]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));

    if (touched[name]) {
      // Validate on change if already touched
      const result = validateProfileForm({ ...formData, [name]: value });
      setErrors((prev) => ({
        ...prev,
        [name]: result.errors[name] || ""
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const result = validateProfileForm(formData);
    setErrors((prev) => ({
      ...prev,
      [field]: result.errors[field] || ""
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Mark all as touched
    setTouched({
      name: true,
      email: true,
      memberId: true,
      phone: true,
      branch: true
    });

    const validation = validateProfileForm(formData);

    if (!validation.isValid) {
      setErrors(validation.errors);
      return;
    }

    setErrors({});
    setMember(formData);
    if (updateUserProfile) {
      updateUserProfile(formData);
    }

    setSavedMessage(true);
    setTimeout(() => {
      setSavedMessage(false);
    }, 4000);
  };

  const handleReset = () => {
    setFormData({
      name: activeUser?.name || "",
      email: activeUser?.email || "",
      memberId: activeUser?.memberId || "",
      phone: activeUser?.phone || "",
      branch: activeUser?.branch || "AK Central Library, Chennai",
      membershipTier: activeUser?.membershipTier || "Gold Scholar"
    });
    setErrors({});
    setTouched({});
  };

  return (
    <div className="profile-view">
      <div className="section-header-bar">
        <div>
          <h2>Member Profile & Reading Analytics</h2>
          <p className="subtitle">
            Manage your verified library credentials and review your real-time reading metrics.
          </p>
        </div>
      </div>

      {/* Reading Statistics Dashboard */}
      <div className="stats-dashboard">
        <h3>📊 Real-Time Reading Statistics (Calculated with useMemo)</h3>
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-label">Currently Borrowed</span>
            <span className="stat-value">{readingStatistics.borrowedCount}</span>
            <span className="stat-hint">Active checkouts</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Overdue Books</span>
            <span className="stat-value overdue-color">{readingStatistics.overdueCount}</span>
            <span className="stat-hint">Action required</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Due Soon</span>
            <span className="stat-value duesoon-color">{readingStatistics.dueSoonCount}</span>
            <span className="stat-hint">Due in ≤ 3 days</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Books Completed</span>
            <span className="stat-value completed-color">{readingStatistics.completedCount}</span>
            <span className="stat-hint">In reading history</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Active Holds</span>
            <span className="stat-value holds-color">{readingStatistics.holdsCount}</span>
            <span className="stat-hint">Waiting list</span>
          </div>

          <div className="stat-card">
            <span className="stat-label">Top Category</span>
            <span className="stat-value top-cat-color">{readingStatistics.topCategory}</span>
            <span className="stat-hint">Most frequent</span>
          </div>
        </div>
      </div>

      {/* Profile Edit Form with Full Validation */}
      <div className="profile-card">
        <div className="profile-card-header">
          <h3>Edit Member Details & Credentials</h3>
          <span className="verified-badge">✓ Verified Circulation Member</span>
        </div>

        {savedMessage && (
          <div className="profile-success-msg" role="status">
            ✓ Member profile updated and saved to circulation records!
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="form-row">
            <Input
              label="Member Full Name"
              id="profile-name"
              name="name"
              type="text"
              required
              value={formData.name}
              onChange={handleChange}
              onBlur={() => handleBlur("name")}
              placeholder="e.g. Aravind Kumar"
              error={touched.name ? errors.name : ""}
              icon="👤"
              helperText="Must be at least 3 characters."
            />

            <Input
              label="Email Address"
              id="profile-email"
              name="email"
              type="email"
              required
              value={formData.email}
              onChange={handleChange}
              onBlur={() => handleBlur("email")}
              placeholder="name@example.com"
              error={touched.email ? errors.email : ""}
              icon="✉️"
              helperText="Valid email format required for renewal notifications."
            />
          </div>

          <div className="form-row">
            <Input
              label="Member ID"
              id="profile-memberId"
              name="memberId"
              type="text"
              required
              value={formData.memberId}
              onChange={handleChange}
              onBlur={() => handleBlur("memberId")}
              placeholder="e.g. AK-LIB-101"
              error={touched.memberId ? errors.memberId : ""}
              icon="🪪"
              helperText="Official library card ID format: AK-LIB-XXX."
            />

            <Input
              label="Phone Number"
              id="profile-phone"
              name="phone"
              type="tel"
              required
              value={formData.phone}
              onChange={handleChange}
              onBlur={() => handleBlur("phone")}
              placeholder="+91 98765 43210"
              error={touched.phone ? errors.phone : ""}
              icon="📞"
              helperText="10-15 digits with optional country code."
            />
          </div>

          <div className="form-row">
            <Input
              label="Library Branch"
              id="profile-branch"
              name="branch"
              type="text"
              required
              value={formData.branch}
              onChange={handleChange}
              onBlur={() => handleBlur("branch")}
              placeholder="e.g. AK Central Library, Chennai"
              error={touched.branch ? errors.branch : ""}
              icon="🏛️"
            />

            <Input
              label="Membership Tier"
              id="profile-tier"
              name="membershipTier"
              type="text"
              value={formData.membershipTier}
              onChange={handleChange}
              placeholder="Gold Scholar"
              icon="⭐"
              helperText="Tier determines loan duration and hold limits."
            />
          </div>

          <div className="profile-actions">
            <Button
              type="submit"
              variant="primary"
              size="md"
              icon="💾"
              id="btn-save-profile"
            >
              Save Profile Changes
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={handleReset}
              icon="↺"
            >
              Reset Form
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Profile;
