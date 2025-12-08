using Bookify.Web.Core.Consts;
using Bookify.Web.Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;
using System.ComponentModel.DataAnnotations; // Add this line
using static System.Runtime.InteropServices.JavaScript.JSType;


namespace Bookify.Web.Core.ViewModels
{
    public class BookFromViewModel
    {
        public int Id { get; set; }

        [Required(ErrorMessage = "Title is required")]
        [MaxLength(500, ErrorMessage = Errors.MaxLength)]
        [Remote("AllowItem", null!, AdditionalFields = "Id,AuthorId", ErrorMessage = Errors.Duplicated)]
        public string Title { get; set; } = null!;

        [Required(ErrorMessage = "Author is required")]
        [Remote("AllowItem", null!, AdditionalFields = "Id,Title", ErrorMessage = Errors.Duplicated)]
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
        public string? ImageUrl { get; set; }

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
