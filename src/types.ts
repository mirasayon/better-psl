import { validate } from "./validate.js";
import { ERROR_CODES } from "./error-codes.js";

export type ParseReturnTypeOnSuccess = {
    input: string;
    tld: null | string;
    sld: null | string;
    domain: null | string;
    subdomain: null | string;
    listed: boolean;
};
export type ErrorCodeNames = Exclude<Required<ReturnType<typeof validate>>, null>;
export type ParseReturnTypeOnError = {
    input?: string;
    message: (typeof ERROR_CODES)[ErrorCodeNames];
    code: ErrorCodeNames;
};
export type ParseReturnTypes =
    | {
          error: ParseReturnTypeOnError;
          parsed: null;
          status: "error";
      }
    | {
          error: null;
          parsed: ParseReturnTypeOnSuccess;
          status: "success";
      };
