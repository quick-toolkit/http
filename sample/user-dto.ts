import { Typed } from '@quick-toolkit/class-transformer';
import { ApiProperty } from '../src';
import { ApiRequest } from '../src';
import { UserVo } from './user-vo';

@ApiRequest({
  url: '/user/{id}',
  method: 'post',
  description: '修改用户',
  scene: 'UserVO',
  response: UserVo,
})
/**
 * @class UserDto
 */
export class UserDto {
  @ApiProperty({
    description: 'ID',
    in: 'path',
    required: true,
  })
  @Typed({ required: true })
  public id: number;

  @ApiProperty({
    description: 'name',
    in: 'query',
    required: true,
  })
  @Typed({ required: true })
  public name: string;

  @ApiProperty({
    description: 'name',
    in: 'query',
    required: true,
  })
  @Typed({ required: true })
  public password: string;
}
