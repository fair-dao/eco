using Microsoft.EntityFrameworkCore;

namespace ForumServer.Models
{
    public class ForumDbContext : DbContext
    {
        public ForumDbContext(DbContextOptions<ForumDbContext> options) : base(options)
        {
        }
        
        public DbSet<User> Users { get; set; }
        public DbSet<Post> Posts { get; set; }
        public DbSet<Comment> Comments { get; set; }
        
        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure relationships and constraints
            modelBuilder.Entity<Post>()
                .HasOne(p => p.User)
                .WithMany()
                .HasForeignKey(p => p.UserId);
                
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.Post)
                .WithMany()
                .HasForeignKey(c => c.PostId);
                
            modelBuilder.Entity<Comment>()
                .HasOne(c => c.User)
                .WithMany()
                .HasForeignKey(c => c.UserId);
        }
    }
}
