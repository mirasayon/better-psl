import { validate } from "../common/validator.js";
import { errorCodes } from "../constants/error-codes.js";

export type ParseReturnType = {
    input: string;
    tld: null | string;
    sld: null | string;
    domain: null | string;
    subdomain: null | string;
    listed: boolean;
};
export type ICode = Exclude<Required<ReturnType<typeof validate>>, undefined>;
export type ParseReturnTypeOnError = {
    input?: string;
    message: (typeof errorCodes)[ICode];
    code: ICode;
};
export type parseReturnType =
    | {
          error: ParseReturnTypeOnError;
          parsed: null;
          status: "error";
      }
    | {
          error: null;
          parsed: ParseReturnType;
          status: "success";
      };
