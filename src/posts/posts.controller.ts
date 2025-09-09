import {
  Controller,
  Post,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiUnauthorizedResponse,
  ApiBadRequestResponse,
  ApiSecurity,
  ApiNotFoundResponse,
  ApiForbiddenResponse,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { PostResponseDto } from './dto/post-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PERMISSIONS } from '../common/constants/permissions-and-roles';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('Posts Management')
@ApiSecurity('JWT-auth')
@ApiBearerAuth('JWT-auth')
@Controller('posts')
@UseGuards(AuthGuard, PermissionsGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PERMISSIONS.CREATE_POST)
  @ApiOperation({
    summary: 'Create a new post',
    description:
      'Create a new blog post. Authors can create posts with title, content, and visibility settings.',
  })
  @ApiResponse({
    status: 201,
    description: 'Post created successfully',
    type: PostResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (create post permission required)',
    schema: {
      example: {
        statusCode: 403,
        message: 'Forbidden resource',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'Title must not exceed 255 characters',
          'Content should not be empty',
          'Visibility must be either PUBLIC or PRIVATE',
        ],
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Author not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Author not found',
        error: 'Not Found',
      },
    },
  })
  async createPost(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreatePostDto,
  ): Promise<PostResponseDto> {
    return this.postsService.createPost(dto, req.user.id);
  }
}
