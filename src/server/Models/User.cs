using System;using System.ComponentModel.DataAnnotations;using System.ComponentModel.DataAnnotations.Schema;

namespace ForumServer.Models
{
    public class User
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [StringLength(100)]
        public string WalletAddress { get; set; }
        
        [StringLength(255)]
        public string Username { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime LastLogin { get; set; } = DateTime.UtcNow;
        
        public bool IsActive { get; set; } = true;
    }
}
