import { Post } from '../entities/post.entity';
import { UpdatePostResponseDto } from '../dto/update-post-response.dto';

export function mapPostToUpdateDto(post: Post): UpdatePostResponseDto {
  const words = post.content?.trim().split(/\s+/).length ?? 0;
  const timeToRead = Math.max(1, Math.ceil(words / 200));

  return {
    id: post.id,
    title: post.title,
    content: post.content,
    visibility: post.visibility,
    authorId: post.author?.id,
    authorName: post.author?.name,
    timeToRead,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}
