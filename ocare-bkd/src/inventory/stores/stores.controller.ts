import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Put,
} from '@nestjs/common';
import { StoreService } from './stores.service';
import type { Request } from 'express';

@Controller('api/store')
export class StoresController {
  constructor(private readonly storeService: StoreService) {}

  @Post('create')
  //@UseGuards(JwtAuthGuard)
  create(
    @Body()
    data: {
      branchId: string;
      name: string;
      authorizedPersonnel: number[];
    },
    @Req() req: Request,
  ) {
    console.log(req);
    // const user = (req as any).user;
    // console.log('user', user);
    // if (
    //   !user ||
    //   !user.role ||
    //   user.role.name?.toLowerCase() !== 'administrator'
    // ) {
    //   throw new ForbiddenException('Only administrators can create stores');
    // }
    return this.storeService.create({
      ...data,
      branchId: data.branchId,
      authorizedPersonnel: data.authorizedPersonnel.map((id) => id),
    });
  }

  @Get('fetch-all/:id')
  findAll(@Param('id') id: string) {
    return this.storeService.findAll(id);
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.storeService.findOne(id);
  }

  @Patch('modify/:id')
  //@UseGuards(JwtAuthGuard)
  update(
    @Param('id') id: string,
    @Body()
    data: {
      branchId: string;
      deptId: string;
      name: string;
      authorizedPersonnel: number[];
    },
    // @Req() req: Request,
  ) {
    // const user = (req as any).user;
    // if (
    //   !user ||
    //   !user.role ||
    //   user.role.name?.toLowerCase() !== 'administrator'
    // ) {
    //   throw new ForbiddenException('Only administrators can modify stores');
    // }
    return this.storeService.update(id, {
      ...data,
      branchId: data.branchId ? data.branchId : undefined,
      authorizedPersonnel: data.authorizedPersonnel.map((id) => id),
    });
  }

  @Delete('delete/:id')
  //@UseGuards(JwtAuthGuard)
  remove(
    @Param('id')
    id: string,
    //@Req() req: Request
  ) {
    // const user = (req as any).user;
    // if (
    //   !user ||
    //   !user.role ||
    //   user.role.name?.toLowerCase() !== 'administrator'
    // ) {
    //   throw new ForbiddenException('Only administrators can delete stores');
    // }
    return this.storeService.remove(id);
  }

  @Put('toogle-store/:id')
  toggleStore(@Param('id') id: string) {
    return this.storeService.toggleStore(id);
  }

  @Put('toogle-app-store/:id')
  toggleAppStore(@Param('id') id: string) {
    return this.storeService.toggleAppStore(id);
  }
}
