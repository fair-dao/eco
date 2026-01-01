using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using ForumServer.DTOs;
using ForumServer.Models;

namespace ForumServer.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly ForumDbContext _context;
        private readonly IConfiguration _configuration;

        public AuthController(ForumDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            try
            {
                // Validate the signature (in a real implementation, you would use TronWeb or similar to verify the signature)
                // For this example, we'll assume the signature is valid if the wallet address is correctly formatted
                if (!IsValidWalletAddress(request.WalletAddress))
                {
                    return BadRequest(new LoginResponse { Success = false, Error = "Invalid wallet address" });
                }

                // Find or create user
                var user = await _context.Users.FirstOrDefaultAsync(u => u.WalletAddress == request.WalletAddress);
                if (user == null)
                {
                    user = new User
                    {
                        WalletAddress = request.WalletAddress,
                        Username = request.WalletAddress.Substring(0, 10) + "...",
                        CreatedAt = DateTime.UtcNow,
                        LastLogin = DateTime.UtcNow,
                        IsActive = true
                    };
                    _context.Users.Add(user);
                    await _context.SaveChangesAsync();
                }
                else
                {
                    user.LastLogin = DateTime.UtcNow;
                    await _context.SaveChangesAsync();
                }

                // Generate JWT token
                var token = GenerateJwtToken(user);

                // Return response
                return Ok(new LoginResponse
                {
                    Success = true,
                    Token = token,
                    User = new UserDto
                    {
                        Id = user.Id,
                        WalletAddress = user.WalletAddress,
                        Username = user.Username,
                        CreatedAt = user.CreatedAt
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new LoginResponse { Success = false, Error = "Login failed: " + ex.Message });
            }
        }

        private string GenerateJwtToken(User user)
        {
            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.WalletAddress),
                new Claim("Username", user.Username)
            };

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                _configuration["Jwt:Issuer"],
                _configuration["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddDays(30),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private bool IsValidWalletAddress(string address)
        {
            // Basic validation - in a real app, use TronWeb.isAddress() or similar
            if (string.IsNullOrWhiteSpace(address)) return false;
            if (address.Length != 34) return false;
            if (!address.StartsWith("T")) return false;
            
            // Check if all characters are valid
            var validChars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
            return address.All(c => validChars.Contains(c));
        }
    }
}
