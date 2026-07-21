import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  UseGuards,
  Body,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RequestUser } from '../auth/interfaces/request-user.interface';
import { ActiveUserResponseDto } from './dto/active-user-response.dto';
import { PaginatedUsersResponseDto } from './dto/paginated-users-response.dto';
import { QueryActiveUsersDto } from './dto/query-active-users.dto';
import { QueryUsersDto } from './dto/query-users.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { UsersService } from './users.service';

@ApiTags('profile')
@ApiBearerAuth()
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@UseGuards(JwtAuthGuard)
@Controller('profile')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('my')
  @ApiOkResponse({ type: UserResponseDto })
  getMyProfile(@CurrentUser() user: RequestUser): Promise<UserResponseDto> {
    return this.usersService.findByIdOrFail(user.id);
  }

  @Patch('my')
  @ApiOkResponse({ type: UserResponseDto })
  updateMyProfile(
    @CurrentUser() user: RequestUser,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.updateMe(user.id, dto);
  }

  @Delete('my')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({ description: 'Profile was soft deleted' })
  deleteMyProfile(@CurrentUser() user: RequestUser): Promise<void> {
    return this.usersService.softDelete(user.id);
  }

  @Get()
  @ApiOkResponse({ type: PaginatedUsersResponseDto })
  findAll(@Query() query: QueryUsersDto): Promise<PaginatedUsersResponseDto> {
    return this.usersService.findAll(query);
  }

  @Get('active')
  @ApiOkResponse({ type: [ActiveUserResponseDto] })
  findActiveUsers(
    @Query() query: QueryActiveUsersDto,
  ): Promise<ActiveUserResponseDto[]> {
    return this.usersService.findActiveUsers(query);
  }

  @Get(':id')
  @ApiOkResponse({ type: UserResponseDto })
  findOne(@Param('id', ParseUUIDPipe) id: string): Promise<UserResponseDto> {
    return this.usersService.findByIdOrFail(id);
  }
}
