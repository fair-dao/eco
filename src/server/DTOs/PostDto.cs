namespace ForumServer.DTOs
{
    public class PostCreateRequest
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
    }
    
    public class PostUpdateRequest
    {
        public string Title { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
    }
    
    public class PostResponse
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Content { get; set; }
        public string Category { get; set; }
        public UserDto Author { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public int Views { get; set; }
        public int Likes { get; set; }
    }
}
