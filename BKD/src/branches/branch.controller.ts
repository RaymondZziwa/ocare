import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { BranchService } from './branch.service';

@Controller('api/branches')
export class BranchController {
  constructor(private readonly branchService: BranchService) {}

  @Post('create')
  create(@Body() data: { name: string; location: string }) {
    return this.branchService.create(data);
  }

  @Get('fetch-all')
  findAll() {
    return this.branchService.findAll();
  }

  @Get('fetch/:id')
  findOne(@Param('id') id: string) {
    return this.branchService.findOne(id);
  }

  @Patch('modify/:id')
  update(
    @Param('id') id: string,
    @Body() data: { name?: string; location?: string },
  ) {
    return this.branchService.update(id, data);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.branchService.remove(id);
  }
}
