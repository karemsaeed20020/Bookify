using Bookify.Web.Core.Models;
using Microsoft.AspNetCore.Mvc.Rendering;
using static System.Runtime.InteropServices.JavaScript.JSType;
using System.ComponentModel.DataAnnotations; // Add this line


namespace Bookify.Web.Core.ViewModels
{
    public class BookFromViewModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [MaxLength(500, ErrorMessage = "Title cannot be more than 500 characters")]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Author is required")]
        [Display(Name = "Author")]
        public int AuthorId { get; set; }

        public IEnumerable<SelectListItem> Authors { get; set; } = new List<SelectListItem>();

        [Required(ErrorMessage = "Publisher is required")]
        [MaxLength(200, ErrorMessage = "Publisher cannot be more than 200 characters")]
        public string Publisher { get; set; } = null!;

        [Required(ErrorMessage = "Publishing date is required")]
        [Display(Name = "Publishing Date")]
        public DateTime PublishingDate { get; set; } = DateTime.Now;

        public IFormFile? Image { get; set; }

        [Display(Name = "Is available for rental?")]
        public bool IsAvailableForRental { get; set; }

        [Required(ErrorMessage = "Hall is required")]
        [MaxLength(50, ErrorMessage = "Hall cannot be more than 50 characters")]
        public string Hall { get; set; } = null!;

        [Required(ErrorMessage = "Description is required")]
        public string Description { get; set; } = null!;

        [Required(ErrorMessage = "At least one category is required")]
        [Display(Name = "Categories")]
        public List<int> SelectedCategories { get; set; } = new List<int>();

        public IEnumerable<SelectListItem> Categories { get; set; } = new List<SelectListItem>();

    }
}
