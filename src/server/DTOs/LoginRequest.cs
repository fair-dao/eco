using System.ComponentModel.DataAnnotations;

namespace ForumServer.DTOs
{
    public class LoginRequest
    {
        [Required]
        public string WalletAddress { get; set; }
        
        [Required]
        public string Signature { get; set; }
        
        [Required]
        public string Message { get; set; }
    }
}
