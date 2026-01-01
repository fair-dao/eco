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
    public class PostsController : ControllerBase
    {
        private readonly ForumDbContext _context;

        public PostsController(ForumDbContext context)
        {
            _context = context;
        }

        // GET: api/Posts
        [HttpGet]
        public async Task<IActionResult> GetPosts([FromQuery] string category = null, [FromQuery] int page = 1, [FromQuery] int pageSize = 10)
        {
            try
            {
                var query = _context.Posts.Include(p => p.User).Where(p => !p.IsDeleted);

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(p => p.Category == category);
                }

                // Calculate pagination
                var total = await query.CountAsync();
                var posts = await query.OrderByDescending(p => p.CreatedAt)
                    .Skip((page - 1) * pageSize)
                    .Take(pageSize)
                    .ToListAsync();

                var postResponses = posts.Select(p => new PostResponse
                {
                    Id = p.Id,
                    Title = p.Title,
                    Content = p.Content,
                    Category = p.Category,
                    Author = new UserDto
                    {
                        Id = p.User.Id,
                        WalletAddress = p.User.WalletAddress,
                        Username = p.User.Username,
                        CreatedAt = p.User.CreatedAt
                    },
                    CreatedAt = p.CreatedAt,
                    UpdatedAt = p.UpdatedAt,
                    Views = p.Views,
                    Likes = p.Likes
                }).ToList();

                return Ok(new
                {
                    Posts = postResponses,
                    Total = total,
                    Page = page,
                    PageSize = pageSize,
                    TotalPages = (int)Math.Ceiling((double)total / pageSize)
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to get posts: " + ex.Message });
            }
        }

        // GET: api/Posts/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetPost(int id)
        {
            try
            {
                var post = await _context.Posts.Include(p => p.User).FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

                if (post == null)
                {
                    return NotFound(new { Error = "Post not found" });
                }

                // Increment view count
                post.Views++;
                await _context.SaveChangesAsync();

                return Ok(new PostResponse
                {
                    Id = post.Id,
                    Title = post.Title,
                    Content = post.Content,
                    Category = post.Category,
                    Author = new UserDto
                    {
                        Id = post.User.Id,
                        WalletAddress = post.User.WalletAddress,
                        Username = post.User.Username,
                        CreatedAt = post.User.CreatedAt
                    },
                    CreatedAt = post.CreatedAt,
                    UpdatedAt = post.UpdatedAt,
                    Views = post.Views,
                    Likes = post.Likes
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to get post: " + ex.Message });
            }
        }

        // POST: api/Posts
        [HttpPost]
        [Authorize]
        public async Task<IActionResult> CreatePost([FromBody] PostCreateRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) {
                    return Unauthorized();
                }
                var userId = int.Parse(userIdClaim.Value);

                var post = new Post
                {
                    Title = request.Title,
                    Content = request.Content,
                    Category = request.Category,
                    UserId = userId,
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow,
                    Views = 0,
                    Likes = 0,
                    IsDeleted = false
                };

                _context.Posts.Add(post);
                await _context.SaveChangesAsync();

                // Return the created post with author information
                await _context.Entry(post).Reference(p => p.User).LoadAsync();

                return CreatedAtAction(nameof(GetPost), new { id = post.Id }, new PostResponse
                {
                    Id = post.Id,
                    Title = post.Title,
                    Content = post.Content,
                    Category = post.Category,
                    Author = new UserDto
                    {
                        Id = post.User.Id,
                        WalletAddress = post.User.WalletAddress,
                        Username = post.User.Username,
                        CreatedAt = post.User.CreatedAt
                    },
                    CreatedAt = post.CreatedAt,
                    UpdatedAt = post.UpdatedAt,
                    Views = post.Views,
                    Likes = post.Likes
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to create post: " + ex.Message });
            }
        }

        // PUT: api/Posts/5
        [HttpPut("{id}")]
        [Authorize]
        public async Task<IActionResult> UpdatePost(int id, [FromBody] PostUpdateRequest request)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) {
                    return Unauthorized();
                }
                var userId = int.Parse(userIdClaim.Value);
                var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

                if (post == null)
                {
                    return NotFound(new { Error = "Post not found" });
                }

                if (post.UserId != userId)
                {
                    return StatusCode(403, new { Error = "You don't have permission to update this post" });
                }

                post.Title = request.Title;
                post.Content = request.Content;
                post.Category = request.Category;
                post.UpdatedAt = DateTime.UtcNow;

                await _context.SaveChangesAsync();

                // Return updated post
                await _context.Entry(post).Reference(p => p.User).LoadAsync();

                return Ok(new PostResponse
                {
                    Id = post.Id,
                    Title = post.Title,
                    Content = post.Content,
                    Category = post.Category,
                    Author = new UserDto
                    {
                        Id = post.User.Id,
                        WalletAddress = post.User.WalletAddress,
                        Username = post.User.Username,
                        CreatedAt = post.User.CreatedAt
                    },
                    CreatedAt = post.CreatedAt,
                    UpdatedAt = post.UpdatedAt,
                    Views = post.Views,
                    Likes = post.Likes
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to update post: " + ex.Message });
            }
        }

        // DELETE: api/Posts/5
        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeletePost(int id)
        {
            try
            {
                var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
                if (userIdClaim == null) {
                    return Unauthorized();
                }
                var userId = int.Parse(userIdClaim.Value);
                var post = await _context.Posts.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

                if (post == null)
                {
                    return NotFound(new { Error = "Post not found" });
                }

                if (post.UserId != userId)
                {
                    return StatusCode(403, new { Error = "You don't have permission to delete this post" });
                }

                post.IsDeleted = true;
                await _context.SaveChangesAsync();

                return Ok(new { Message = "Post deleted successfully" });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Error = "Failed to delete post: " + ex.Message });
            }
        }
    }
}