import { Module } from '@nestjs/common';
import { FirebaseModule } from './firebase/firebase.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { ArticlesModule } from './articles/articles.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    FirebaseModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    ArticlesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}