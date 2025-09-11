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
import { CommentsService } from '../comments/comments.service';
import { CreateCommentDto } from '../comments/dto/create-comment.dto';
import { ListCommentsDto } from '../comments/dto/list-comments.dto';
import {
  CommentResponseDto,
  ListCommentsResponseDto,
} from '../comments/dto/comment-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PERMISSIONS } from '../common/constants/permissions-and-roles';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('Posts Management')
@ApiSecurity('JWT-auth')
@ApiBearerAuth('JWT-auth')
@Controller('posts/:postId/comments')
@UseGuards(AuthGuard, PermissionsGuard)
export class PostCommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get()
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.VIEW_POSTS)
  @ApiOperation({
    summary: 'List comments for a post',
    description:
      'Get a paginated list of comments for a specific post, ordered by creation date (oldest first).',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comments retrieved successfully',
    type: ListCommentsResponseDto,
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
  @ApiNotFoundResponse({
    description: 'Post not found or not accessible',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post with ID 123 not found',
        error: 'Not Found',
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
  async listComments(
    @Param('postId', ParseIntPipe) postId: number,
    @Query() dto: ListCommentsDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<ListCommentsResponseDto> {
    return this.commentsService.listComments(postId, dto, req.user.id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @RequirePermissions(PERMISSIONS.CREATE_COMMENT)
  @ApiOperation({
    summary: 'Create a new comment',
    description:
      'Create a new comment on a post. Users need CREATE_COMMENT permission.',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Comment created successfully',
    type: CommentResponseDto,
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
    description:
      'Insufficient permissions (create comment permission required)',
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
        message: ['Content should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Post not found or not accessible',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Post with ID 123 not found',
        error: 'Not Found',
      },
    },
  })
  async createComment(
    @Param('postId', ParseIntPipe) postId: number,
    @Body() dto: CreateCommentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<CommentResponseDto> {
    return this.commentsService.createComment(postId, dto, req.user);
  }
}
