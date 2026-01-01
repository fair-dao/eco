namespace ForumServer.DTOs
{
    public class LoginResponse
    {
        public bool Success { get; set; }
        public string Token { get; set; }
        public UserDto User { get; set; }
        public string Error { get; set; }
    }
    
    public class UserDto
    {
        public int Id { get; set; }
        public string WalletAddress { get; set; }
        public string Username { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
