/**
 * MIT License
 * Copyright (c) 2021 YunlongRan<549510622@qq.com> quicker-js/http
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { ClassMirror } from '@quick-toolkit/class-mirror';
import { Axios, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiPropertyDecorate, ApiRequestDecorate } from '../../metadatas';

import defaults from 'axios/lib/defaults';
import mergeConfig from 'axios/lib/core/mergeConfig';

/**
 * @class HttpClient
 */
export class HttpClient extends Axios {
  /**
   * 创建HttpClient实例
   * @param config
   */
  public static create(config?: AxiosRequestConfig): HttpClient {
    return new HttpClient(mergeConfig(defaults, config));
  }

  /**
   * 解析请求参数
   * @param data
   * @param config
   */
  public static parseConfig<D extends {} = any>(
    data: D,
    config: AxiosRequestConfig<D> = {}
  ): {
    config: AxiosRequestConfig<D>;
    metadata: ApiRequestDecorate[];
  } {
    const classMirror = ClassMirror.reflect(data.constructor);
    const filter = classMirror.getDecorates(ApiRequestDecorate);

    filter.forEach((o: ApiRequestDecorate) => {
      config.url = o.metadata.url;
      config.method = o.metadata.method;
      config.headers = config.headers = {};
      if (o.metadata.contentType) {
        config.headers['Content-Type'] = o.metadata.contentType;
      }
      const newData: Record<PropertyKey, any> = {};
      const propertyMirrors = classMirror.getAllProperties();
      const pathVars: Record<string, string> = {};
      propertyMirrors.forEach((propertyMirror) => {
        const value = data[propertyMirror.propertyKey as keyof D] as any;
        if (value !== undefined && value !== '') {
          propertyMirror.getAllDecorates(ApiPropertyDecorate).forEach((m) => {
            if (m.metadata.in === 'path') {
              pathVars[propertyMirror.propertyKey as string] = value;
              config.url = o.metadata.url;
            } else if (m.metadata.in === 'header') {
              config.headers = config.headers || {};
              config.headers[propertyMirror.propertyKey as any] = value;
            } else {
              newData[propertyMirror.propertyKey] = value;
            }
          });
        }
      });
      Object.keys(pathVars).forEach((key) => {
        config.url = (config.url || '')?.replace(
          new RegExp(`{s*${key}s*}`),
          pathVars[key]
        );
      });

      if (['post', 'put', 'patch'].includes(config.method)) {
        config.data = newData;
      }

      // nobody
      if (['delete', 'get', 'head', 'options'].includes(config.method)) {
        config.params = newData;
      }
    });
    if (!filter.length) {
      throw new TypeError('Invalid ApiRequestDecorate.');
    }

    return {
      config,
      metadata: filter,
    };
  }

  /**
   * 发起请求
   * @param data 此字段必须是带有@ApiRequest的class实例
   * @param config
   */
  public fetch<T = any, D extends {} = any>(
    data: D,
    config: AxiosRequestConfig<D> = {}
  ): Promise<AxiosResponse<T, D>> {
    return this.request(HttpClient.parseConfig(data, config).config);
  }
}
