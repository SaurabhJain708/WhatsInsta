class ApiError extends Error {
    statusCode: number;
    data: unknown;
    success: boolean;
    errors: Array<unknown>;
  
    constructor(
      statusCode: number,
      message: string = "Something went wrong",
      errors: Array<unknown> = [],
      stack: string = ""
    ) {
      super(message);
      this.statusCode = statusCode;
      this.data = null;
      this.success = false;
      this.errors = errors;
  
      if (stack) {
        this.stack = stack;
      } else {
        Error.captureStackTrace(this, this.constructor);
      }
    }
  }
  
  export { ApiError };