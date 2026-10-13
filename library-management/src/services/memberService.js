/**
 * Member Service Layer
 * Encapsulates REST API interactions for member profiles and membership data.
 */

import { apiClient } from "./apiClient";

export const memberService = {
  /**
   * Requirement a: Fetch member information using REST APIs
   * GET /api/members/current
   */
  async fetchCurrentMember({ signal } = {}) {
    const response = await apiClient.get("/members/current", { signal });
    return response.member;
  },

  /**
   * Fetch specific member by ID
   * GET /api/members/:id
   */
  async fetchMemberById(id, { signal } = {}) {
    const response = await apiClient.get(`/members/${id}`, { signal });
    return response.member;
  },

  /**
   * Update member profile via REST API
   * PUT /api/members/:id
   */
  async updateMemberProfile(id, profileData) {
    const response = await apiClient.put(`/members/${id}`, profileData);
    return response.member;
  }
};
