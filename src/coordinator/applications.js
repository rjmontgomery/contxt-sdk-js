import { toCamelCase } from '../utils/objects';

/**
 * @typedef {Object} ContxtApplication
 * @property {string} clientId
 * @property {string} clientSecret
 * @property {string} createdAt ISO 8601 Extended Format date/time string
 * @property {string} currentVersionId
 * @property {string} description
 * @property {string} iconUrl
 * @property {number} id
 * @property {string} name
 * @property {number} serviceId
 * @property {string} type
 * @property {string} updatedAt ISO 8601 Extended Format date/time string
 */

/**
 * @typedef {Object} ContxtOrganizationFeaturedApplication
 * @property {number} applicationId
 * @property {string} createdAt ISO 8601 Extended Format date/time string
 * @property {string} id
 * @property {string} organizationId
 * @property {string} updatedAt ISO 8601 Extended Format date/time string
 */

/**
 * @typedef {Object} ContxtUserFavoriteApplication
 * @property {number} applicationId
 * @property {string} createdAt ISO 8601 Extended Format date/time string
 * @property {string} id
 * @property {string} updatedAt ISO 8601 Extended Format date/time string
 * @property {string} userId
 */

/**
 * Module that provides access to contxt applications
 *
 * @typicalname contxtSdk.coordinator.applications
 */
class Applications {
  /**
   * @param {Object} sdk An instance of the SDK so the module can communicate with other modules
   * @param {Object} request An instance of the request module tied to this module's audience.
   * @param {string} baseUrl The base URL provided by the parent module
   */
  constructor(sdk, request, baseUrl) {
    this._baseUrl = baseUrl;
    this._request = request;
    this._sdk = sdk;
  }

  /**
   * Adds an application to the current user's list of favorited applications
   *
   * API Endpoint: '/applications/:applicationId/favorites'
   * Method: POST
   *
   * Note: Only valid for web users using auth0WebAuth session type
   *
   * @param {number} applicationId The ID of the application
   *
   * @returns {Promise}
   * @fulfill {ContxtUserFavoriteApplication} Information about the contxt application favorite
   * @reject {Error}
   *
   * @example
   * contxtSdk.coordinator.applications
   *   .addFavorite(25)
   *   .then((favoriteApplication) => console.log(favoriteApplication))
   *   .catch((err) => console.log(err));
   */
  addFavorite(applicationId) {
    if (!applicationId) {
      return Promise.reject(
        new Error(
          'An application ID is required for creating a favorite application'
        )
      );
    }

    return this._request
      .post(`${this._baseUrl}/applications/${applicationId}/favorites`)
      .then((favoriteApplication) => toCamelCase(favoriteApplication));
  }

  /**
   * Gets information about all contxt applications
   *
   * API Endpoint: '/applications'
   * Method: GET
   *
   * @returns {Promise}
   * @fulfill {ContxtApplication[]} Information about all contxt applications
   * @reject {Error}
   *
   * @example
   * contxtSdk.coordinator.applications
   *   .getAll()
   *   .then((apps) => console.log(apps))
   *   .catch((err) => console.log(err));
   */
  getAll() {
    return this._request
      .get(`${this._baseUrl}/applications`)
      .then((apps) => apps.map((app) => toCamelCase(app)));
  }

  /**
   * Gets the current user's list of favorited applications
   *
   * API Endpoint: '/applications/favorites'
   * Method: GET
   *
   * Note: Only valid for web users using auth0WebAuth session type
   *
   * @returns {Promise}
   * @fulfill {ContxtUserFavoriteApplication[]} A list of favorited applications
   * @reject {Error}
   *
   * @example
   * contxtSdk.coordinator.applications
   *   .getFavorites()
   *   .then((favoriteApplications) => console.log(favoriteApplications))
   *   .catch((err) => console.log(err));
   */
  getFavorites() {
    return this._request
      .get(`${this._baseUrl}/applications/favorites`)
      .then((favoriteApps) => toCamelCase(favoriteApps));
  }

  /**
   * Gets an organization's list of featured applications
   *
   * API Endpoint: '/organizations/:organizationId/applications/featured'
   * Method: GET
   *
   * Note: Only valid for web users using auth0WebAuth session type
   *
   * @param {string} organizationId The ID of the organization
   *
   * @returns {Promise}
   * @fulfill {ContxtOrganizationFeaturedApplication[]} A list of featured applications
   * @reject {Error}
   *
   * @example
   * contxtSdk.coordinator.applications
   *   .getFeatured('36b8421a-cc4a-4204-b839-1397374fb16b')
   *   .then((featuredApplications) => console.log(featuredApplications))
   *   .catch((err) => console.log(err));
   */
  getFeatured(organizationId) {
    if (!organizationId) {
      return Promise.reject(
        new Error(
          'An organization ID is required for getting featured applications for an organization'
        )
      );
    }

    return this._request
      .get(
        `${this._baseUrl}/organizations/${organizationId}/applications/featured`
      )
      .then((featuredApplications) => toCamelCase(featuredApplications));
  }

  /**
   * Removes an application from the current user's list of favorited applications
   *
   * API Endpoint: '/applications/:applicationId/favorites'
   * Method: DELETE
   *
   * Note: Only valid for web users using auth0WebAuth session type
   *
   * @param {number} applicationId The ID of the application
   *
   * @returns {Promise}
   * @fulfill {undefined}
   * @reject {Error}
   *
   * @example
   * contxtSdk.coordinator.applications
   *   .removeFavorite(25)
   *   .catch((err) => console.log(err));
   */
  removeFavorite(applicationId) {
    if (!applicationId) {
      return Promise.reject(
        new Error(
          'An application ID is required for deleting a favorite application'
        )
      );
    }

    return this._request.delete(
      `${this._baseUrl}/applications/${applicationId}/favorites`
    );
  }
}

export default Applications;