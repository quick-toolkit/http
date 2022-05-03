import { AxiosRequestConfig, AxiosResponse } from 'axios';

/**
 * 异常类
 */
export class HttpException<T = any, D = any> extends Error {
  /**
   * 构造函数
   * @param config
   * @param response
   * @param message
   */
  public constructor(
    public config: AxiosRequestConfig<D>,
    public response: AxiosResponse<T, D>,
    message?: string
  ) {
    super(message);
  }

  public isAxiosError = true;

  /**
   * 转换为json
   */
  public toJSON(): object {
    return this.response;
  }

  public name = 'HttpException';
}
