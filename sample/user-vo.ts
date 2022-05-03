import { Prop } from '@quick-toolkit/class-transformer';

/**
 * @class UserVo
 */
export class UserVo {
  @Prop.default
  public id: number;

  @Prop.default
  public name: string;

  @Prop.default
  public password: string;
}
