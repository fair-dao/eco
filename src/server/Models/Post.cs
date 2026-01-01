using System;using System.ComponentModel.DataAnnotations;using System.ComponentModel.DataAnnotations.Schema;

namespace ForumServer.Models
{
    public class Post
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }
        
        [Required]
        [StringLength(200)]
        public string Title { get; set; }
        
        [Required]
        public string Content { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [ForeignKey("UserId")]
        public User User { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
        
        public int Views { get; set; } = 0;
        
        public int Likes { get; set; } = 0;
        
        public bool IsDeleted { get; set; } = false;
        
        [StringLength(50)]
        public string Category { get; set; }
    }
}
