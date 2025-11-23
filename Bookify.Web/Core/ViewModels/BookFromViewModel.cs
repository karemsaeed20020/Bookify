using Bookify.Web.Core.Models;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace Bookify.Web.Core.ViewModels
{
    public class BookFromViewModel
    {
        public int Id { get; set; }
        [MaxLength(500)]
        public string Title { get; set; } = null!;
        [Display(Name = "Author")]
        public int AuthorId { get; set; }
        public IEnumerable<SelectList>? Authors { get; set; }
        [MaxLength(200)]
        public string Publisher { get; set; } = null!;
        [Display(Name = "Publishing Date")]
        public DateTime PublishingDate { get; set; }
        public IFormFile? Image { get; set; }
        [Display(Name = "Is available for renals?")]
        public bool IsAvailableForRental { get; set; }
        [MaxLength(50)]
        public string Hall { get; set; } = null!;
        public string Description { get; set; } = null!;
        public IList<int> SelectedCategories { get; set; } = new List<int>();
        public IEnumerable<SelectList>? Categories { get; set; }
    }
}
