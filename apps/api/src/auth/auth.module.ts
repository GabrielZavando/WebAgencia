import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { FirebaseModule } from '../firebase/firebase.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [FirebaseModule, UsersModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [],
})
export class AuthModule {}
