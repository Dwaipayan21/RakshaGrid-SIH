/**
 * Standard API Success Response Wrapper
 */
class ApiResponse {
  /**
   * @param {number} statusCode
   * @param {*} data
   * @param {string} [message='Success']
   * @param {object} [metadata=null]
   */
  constructor(statusCode, data = null, message = 'Success', metadata = null) {
    this.success = statusCode < 400;
    this.statusCode = statusCode;
    this.message = message;
    this.data = data;
    if (metadata) {
      this.metadata = metadata;
    }
  }

  static success(res, data, message = 'Success', statusCode = 200, metadata = null) {
    return res.status(statusCode).json(new ApiResponse(statusCode, data, message, metadata));
  }

  static created(res, data, message = 'Resource created successfully', metadata = null) {
    return res.status(201).json(new ApiResponse(201, data, message, metadata));
  }
}

module.exports = ApiResponse;
