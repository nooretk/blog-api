import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PostsController } from './posts.controller';
import { PostCommentsController } from './post-comments.controller';
import { PostsService } from './posts.service';
import { Post } from './entities/post.entity';
import { UsersModule } from '../users/users.module';
import { RbacModule } from '../rbac/rbac.module';
import { AuthModule } from '../auth/auth.module';
import { CommentsModule } from '../comments/comments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Post]),
    UsersModule,
    RbacModule,
    AuthModule,
    CommentsModule,
  ],
  controllers: [PostsController, PostCommentsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
