namespace Bookify.Web.Core.Models
{
    public class Book : BaseModel
    {
        public int Id { get; set; }
        [MaxLength(500)]
        public string Title { get; set; } = null!;
        public int AuthorId { get; set; }
        public Author? Author { get; set; }
        [MaxLength(200)]
        public string Publisher { get; set; } = null!;
        public DateTime PublishingDate { get; set; }
        public string? ImageUrl { get; set; }
        public bool IsAvailableForRental { get; set; }
        [MaxLength(50)]
        public string Hall { get; set; } = null!;
        public string Description { get; set; } = null!;
    }
}
