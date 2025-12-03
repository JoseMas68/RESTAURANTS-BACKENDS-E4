import { Module } from '@nestjs/common';
import { MenuItemsController } from './menu-items.controller';
import { MenuItemsService } from './menu-items.service';
import { MenuItemsRepository } from './menu-items.repository';
import { DatabaseModule } from '@database/database.module';
import { MenusModule } from '@modules/menus/menus.module';

@Module({
  imports: [DatabaseModule, MenusModule],
  controllers: [MenuItemsController],
  providers: [MenuItemsService, MenuItemsRepository],
})
export class MenuItemsModule {}
