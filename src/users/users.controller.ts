import {
  Body,
  Controller,
  Post,
  Get,
  Param,
  Query,
  Delete,
  Patch,
  NotFoundException,
  Session,
  UseInterceptors,
  UseGuards
} from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dtos/update-user.dto';
import { Serialize } from 'src/interceptiors/serialize.interceptor';
import { UserDto } from './dtos/user.dto';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from './user.entity';
import { CurrentUserInterceptor } from './interceptiors/current-user.interceptor';
import {AuthGuard} from "./guards/auth.guard"

@Controller('auth')
@Serialize(UserDto)
@UseInterceptors(CurrentUserInterceptor)
export class UsersController {
  constructor(
    private userService: UsersService,
    private authUser: AuthService,
  ) {}

  // @Get('/whoami')
  // async getCurrentUser(@Session() session:any){
  //   return await this.userService.findOne(session.userId)
  // }

  @Get('/whoami')
  @UseGuards(AuthGuard)
  whoAmI(@CurrentUser() user: User) {
    return user;
  }

  @Post('/sing-up')
  async createUser(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authUser.singup(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  // @Get('/colors/:color')
  // setColor(@Param('color') color:string , @Session() session:any ){
  //   session.color=color
  // }

  // @Get('colors')
  // getColor(@Session() session:any){
  //   return session.color
  // }

  @Post('/sing-in')
  async singin(@Body() body: CreateUserDto, @Session() session: any) {
    const user = await this.authUser.singin(body.email, body.password);
    session.userId = user.id;
    return user;
  }

  @Post('/sign-out')
  async singout(@Session() session: any) {
    session.userId = null;
  }
  // @UseInterceptors(new SerializeInterceptor(UserDto))
  @Get('/:id')
  async findUser(@Param('id') id: string) {
    const user = await this.userService.findOne(parseInt(id));
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  @Get()
  find(@Query('email') email: string) {
    return this.userService.find(email);
  }

  @Delete('/:id')
  removeUser(@Param('id') id: string) {
    return this.userService.remove(parseInt(id));
  }

  @Patch('/:id')
  updateUser(@Param('id') id: string, @Body() body: UpdateUserDto) {
    return this.userService.update(parseInt(id), body);
  }
}
