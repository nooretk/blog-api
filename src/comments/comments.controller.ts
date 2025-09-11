import {
  Controller,
  Get,
  Patch,
  Delete,
  Body,
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
} from '@nestjs/swagger';
import { CommentsService } from './comments.service';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { CommentResponseDto } from './dto/comment-response.dto';
import { AuthGuard } from '../auth/auth.guard';
import { PERMISSIONS } from '../common/constants/permissions-and-roles';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request';
import { PermissionsGuard } from '../rbac/guards/permissions.guard';
import { RequirePermissions } from '../rbac/decorators/require-permissions.decorator';

@ApiTags('Individual Comments Management')
@ApiSecurity('JWT-auth')
@ApiBearerAuth('JWT-auth')
@Controller('comments')
@UseGuards(AuthGuard, PermissionsGuard)
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @Get(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.VIEW_POSTS)
  @ApiOperation({
    summary: 'Get a single comment',
    description: 'Retrieve a specific comment by its ID.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment retrieved successfully',
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
  @ApiNotFoundResponse({
    description: 'Comment not found or not accessible',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Comment with ID 123 not found',
        error: 'Not Found',
      },
    },
  })
  async getComment(
    @Param('id', ParseIntPipe) commentId: number,
    @Request() req: AuthenticatedRequest,
  ): Promise<CommentResponseDto> {
    return await this.commentsService.getComment(commentId, req.user.id);
  }

  @Patch(':id')
  @HttpCode(HttpStatus.OK)
  @RequirePermissions(PERMISSIONS.EDIT_COMMENT_OWN)
  @ApiOperation({
    summary: 'Update a comment',
    description:
      'Update an existing comment. Users can only update their own comments.',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Comment updated successfully',
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
      "Insufficient permissions or trying to edit another user's comment",
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You can only edit your own comments',
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
    description: 'Comment not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Comment with ID 123 not found',
        error: 'Not Found',
      },
    },
  })
  async updateComment(
    @Param('id', ParseIntPipe) commentId: number,
    @Body() dto: UpdateCommentDto,
    @Request() req: AuthenticatedRequest,
  ): Promise<CommentResponseDto> {
    return this.commentsService.updateComment(commentId, dto, req.user.id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @RequirePermissions(
    PERMISSIONS.DELETE_COMMENT_OWN,
    PERMISSIONS.DELETE_COMMENT_ANY,
  )
  @ApiOperation({
    summary: 'Delete a comment',
    description:
      'Delete a comment. Users can delete their own comments with DELETE_COMMENT_OWN permission. Admins can delete any comment with DELETE_COMMENT_ANY permission.',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Comment deleted successfully',
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
      "Insufficient permissions or trying to delete another user's comment",
    schema: {
      example: {
        statusCode: HttpStatus.FORBIDDEN,
        message: 'You do not have permission to delete this comment',
      },
    },
  })
  @ApiNotFoundResponse({
    description: 'Comment not found',
    schema: {
      example: {
        statusCode: HttpStatus.NOT_FOUND,
        message: 'Comment with ID 123 not found',
        error: 'Not Found',
      },
    },
  })
  async deleteComment(
    @Param('id', ParseIntPipe) commentId: number,
    @Request() req: AuthenticatedRequest,
  ): Promise<void> {
    return this.commentsService.deleteComment(commentId, req.user);
  }
}
