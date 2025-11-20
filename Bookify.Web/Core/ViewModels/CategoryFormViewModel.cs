namespace Bookify.Web.Core.ViewModels
{
    public class CategoryFormViewModel
    {
        public int Id { get; set; }
        [MaxLength(5, ErrorMessage = "Max Length Cant be more than 100 chrs")]
        public string Name { get; set; } = null!;
    }
}
