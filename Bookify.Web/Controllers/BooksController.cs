using AutoMapper;
using Bookify.Web.Core.Consts;
using Bookify.Web.Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace Bookify.Web.Controllers
{
    public class BooksController : Controller
    {
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        private List<string> _allowedExtensions = new() { ".jpg", ".jpeg", ".png" };
        private int _maxAllowedSize = 2097152;


        // KEEP ONLY ONE CONSTRUCTOR
        public BooksController(ApplicationDbContext context, IMapper mapper, IWebHostEnvironment webHostEnvironment)
        {
            _context = context;
            _mapper = mapper;
            _webHostEnvironment = webHostEnvironment;
        }

        public IActionResult Index()
        {
            return View();
        }
        public IActionResult Create()
        {
            
            return View("Form", PopulateViewModel());
        }
        [HttpPost]
        [AutoValidateAntiforgeryToken]
        public IActionResult Create(BookFromViewModel model)
        {
            
            if (!ModelState.IsValid)
            {
                return View("Form", PopulateViewModel(model));
            }
            var book = _mapper.Map<Book>(model);
            if (model.Image is not null)
            {
                var extension = Path.GetExtension(model.Image.FileName);
                if (!_allowedExtensions.Contains(extension))
                {
                    ModelState.AddModelError(nameof(model.Image), Errors.NotAllowedExtension);
                    return View("Form", PopulateViewModel(model));
                }
                if (model.Image.Length > _maxAllowedSize)
                {
                    ModelState.AddModelError(nameof(model.Image), Errors.MaxSize);
                    return View("Form", PopulateViewModel(model));
                }
                var imageName = $"{Guid.NewGuid()}{extension}";
                var path = Path.Combine($"{_webHostEnvironment.WebRootPath}/images/books", imageName);
                using var stream = System.IO.File.Create(path);
                model.Image.CopyTo(stream);
                book.ImageUrl = imageName;
            }
            foreach(var category in model.SelectedCategories)
            {
                book.Categories.Add(new BookCategory { CategoryId = category});
            }
            _context.Add(book);
            _context.SaveChanges();
            return RedirectToAction(nameof(Index));
        }
        private BookFromViewModel PopulateViewModel(BookFromViewModel? model = null)
        {
            BookFromViewModel viewModel = model is null ? new BookFromViewModel() : model;
            var authors = _context.Authors.Where(a => !a.IsDeleted).OrderBy(a => a.Name).ToList();
            var categories = _context.Categories.Where(a => !a.IsDeleted).OrderBy(a => a.Name).ToList();

            viewModel.Authors = _mapper.Map<IEnumerable<SelectListItem>>(authors);
            viewModel.Categories = _mapper.Map<IEnumerable<SelectListItem>>(categories);
            
            return viewModel;
        } 
    }

}
