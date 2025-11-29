using AutoMapper;
using Bookify.Web.Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Rendering;

namespace Bookify.Web.Controllers
{
    public class BooksController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;

        // KEEP ONLY ONE CONSTRUCTOR
        public BooksController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
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
