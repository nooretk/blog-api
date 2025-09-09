import {
  Controller,
  Post,
  Get,
  Body,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
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
  ApiQuery,
} from '@nestjs/swagger';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { CreatePostResponseDto } from './dto/create-post-response.dto';
import { ListPostsDto } from './dto/list-posts.dto';
import { ListPostsResponseDto } from './dto/list-posts-response.dto';
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

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.VIEW_POSTS)
  @ApiOperation({
    summary: 'List posts for authenticated user',
    description:
      'Get a paginated list of posts. Shows public posts from all users and private posts from the authenticated user, ordered by creation date (newest first). Includes search functionality.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Posts retrieved successfully',
    type: ListPostsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    schema: {
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter posts by title or content',
    example: 'javascript',
  })
  async listPosts(
    @Query() dto: ListPostsDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ListPostsResponseDto> {
    return this.postsService.listPosts(dto, req.user.id);
  }

  @Get('my-posts')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.VIEW_POSTS)
  @ApiOperation({
    summary: "List authenticated user's posts",
    description:
      'Get a paginated list of posts authored by the authenticated user only. Includes both public and private posts owned by the user, ordered by creation date (newest first). Includes search functionality.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: "User's posts retrieved successfully",
    type: ListPostsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    schema: {
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter posts by title or content',
    example: 'javascript',
  })
  async listMyPosts(
    @Query() dto: ListPostsDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ListPostsResponseDto> {
    return this.postsService.listUserPosts(dto, req.user.id, req.user.id);
  }

  @Get('user/:userId')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.VIEW_POSTS)
  @ApiOperation({
    summary: 'List posts by specific user',
    description:
      'Get a paginated list of posts authored by a specific user. Shows only public posts unless the requesting user is viewing their own posts (in which case private posts are also included). Ordered by creation date (newest first). Includes search functionality.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'User posts retrieved successfully',
    type: ListPostsResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    schema: {
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      },
    },
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number (starts from 1)',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page (max 100)',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term to filter posts by title or content',
    example: 'javascript',
  })
  async listUserPosts(
    @Param('userId', ParseIntPipe) userId: number,
    @Query() dto: ListPostsDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ListPostsResponseDto> {
    return this.postsService.listUserPosts(dto, userId, req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PERMISSIONS.CREATE_POST)
  @ApiOperation({
    summary: 'Create a new post',
    description:
      'Create a new blog post. Authors can create posts with title, content, and visibility settings.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Post created successfully',
    type: CreatePostResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Authentication required',
    schema: {
      example: {
        statusCode: HttpStatus.UNAUTHORIZED,
        message: 'Unauthorized',
      },
    },
  })
  @ApiForbiddenResponse({
    description: 'Insufficient permissions (create post permission required)',
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'Forbidden resource',
      },
    },
  })
  @ApiBadRequestResponse({
    description: 'Validation failed',
    schema: {
      example: {
        statusCode: HttpStatus.BAD_REQUEST,
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
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Author not found',
        error: 'Not Found',
      },
    },
  })
  async createPost(
    @Request() req: AuthenticatedRequest,
    @Body() dto: CreatePostDto,
  ): Promise<CreatePostResponseDto> {
    return this.postsService.createPost(dto, req.user.id);
  }
}
