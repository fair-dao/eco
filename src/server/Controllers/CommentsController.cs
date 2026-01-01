using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using ForumServer.DTOs;
using ForumServer.Models;

namespace ForumServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CommentsController : ControllerBase
    {
        private readonly ForumDbContext _context;

        public CommentsController(ForumDbContext context)
        {
            _context = context;
        }

        // GET: api/Comments/Post/5
        [HttpGet("Post/{postId}")]
        public async Task<IActionResult> GetCommentsByPost(int postId)
        {
            try
            {
                var comments = await _context.Comments
                    .Include(c => c.User)
                    .Where(c => c.PostId == postId && !c.IsDeleted)
                    .OrderBy(c => c.CreatedAt)
                    .ToListAsync();

                var commentResponses = comments.Select(c => new CommentResponse
                {
                    Id = c.Id,
                    Content = c.Content,
                    Author = new UserDto
                    {
                        Id = c.User.Id,
                        WalletAddress = c.User.WalletAddress,
                        Username = c.User.Username,
                        CreatedAt = c.User.CreatedAt
                    },
                    CreatedAt = c.CreatedAt,
                    UpdatedAt = c.UpdatedAt
                }).ToList();

                return Ok(commentResponses);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to get comments: " + ex.Message });
            }
        }

        // POST: api/Comments
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreateComment(int postId, [FromBody] CommentCreateRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) {
                    return Unauthorized();
                }
                var userId = int.Parse(userIdClaim.Value);

                // Verify post exists
                var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == postId && !p.IsDeleted);
                if (post == null)
                {
                    return NotFound(new { Error = "Post not found" });
                }

                var comment = new Comment
                {
                    Content = request.Content,
                    PostId = postId,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    IsDeleted = false
                };

                _context.Comments.Add(comment);
                await _context.SaveChangesAsync();

                // Return the created comment with author information
                await _context.Entry(comment).Reference(c => c.User).LoadAsync();

                return CreatedAtAction(nameof(GetCommentsByPost), new { postId = postId }, new CommentResponse
                {
                    Id = comment.Id,
                    Content = comment.Content,
                    Author = new UserDto
                    {
                        Id = comment.User.Id,
                        WalletAddress = comment.User.WalletAddress,
                        Username = comment.User.Username,
                        CreatedAt = comment.User.CreatedAt
                    },
                    CreatedAt = comment.CreatedAt,
                    UpdatedAt = comment.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to create comment: " + ex.Message });
            }
        }

        // PUT: api/Comments/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdateComment(int id, [FromBody] CommentUpdateRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) {
                    return Unauthorized();
                }
                var userId = int.Parse(userIdClaim.Value);
                var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

                if (comment == null)
                {
                    return NotFound(new { Error = "Comment not found" });
                }

                if (comment.UserId != userId)
                {
                    return StatusCode(403, new { Error = "You don't have permission to update this comment" });
                }

                comment.Content = request.Content;
                comment.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Return updated comment
                await _context.Entry(comment).Reference(c => c.User).LoadAsync();

                return Ok(new CommentResponse
                {
                    Id = comment.Id,
                    Content = comment.Content,
                    Author = new UserDto
                    {
                        Id = comment.User.Id,
                        WalletAddress = comment.User.WalletAddress,
                        Username = comment.User.Username,
                        CreatedAt = comment.User.CreatedAt
                    },
                    CreatedAt = comment.CreatedAt,
                    UpdatedAt = comment.UpdatedAt
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to update comment: " + ex.Message });
            }
        }

        // DELETE: api/Comments/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteComment(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) {
                    return Unauthorized();
                }
                var userId = int.Parse(userIdClaim.Value);
                var comment = await _context.Comments.FirstOrDefaultAsync(c => c.Id == id && !c.IsDeleted);

                if (comment == null)
                {
                    return NotFound(new { Error = "Comment not found" });
                }

                if (comment.UserId != userId)
                {
                    return StatusCode(403, new { Error = "You don't have permission to delete this comment" });
                }

                comment.IsDeleted = true;
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Comment deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to delete comment: " + ex.Message });
            }
        }
    }
}