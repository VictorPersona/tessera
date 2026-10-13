export interface SuccessConfig {
  statusCode: number;
  data: any;
}
export interface ErrorConfig {
  statusCode: number;
  errorMsg: string;
}

type ResponseEnvelopeConfig =
  | { success: SuccessConfig; error?: undefined }
  | { success?: undefined; error: ErrorConfig };

export class ResponseEnvelope {
 public success?:SuccessConfig
 public error?:ErrorConfig
  constructor(responseObj: ResponseEnvelopeConfig) {
    this.success = responseObj.success;
    this.error=responseObj.error
  }
}

export class SuccessData {
  public statusCode: number;
  public data: any;
  constructor({ statusCode, data }: SuccessConfig) {
    this.statusCode = statusCode;
    this.data = data;
  }
}

export class ErrorData {
  public statusCode: number;
  public errorMsg: string;
  constructor({ statusCode, errorMsg }: ErrorConfig) {
    this.errorMsg = errorMsg;
    this.statusCode = statusCode;
  }
}
