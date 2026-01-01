namespace ForumServer.DTOs
{
    public class CommentCreateRequest
    {
        public string? Content { get; set; }
    }
    
    public class CommentUpdateRequest
    {
        public string? Content { get; set; }
    }
    
    public class CommentResponse
    {
        public int Id { get; set; }
        public string? Content { get; set; }
        public UserDto? Author { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
    }
}