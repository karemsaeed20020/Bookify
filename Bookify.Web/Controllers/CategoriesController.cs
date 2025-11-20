using Bookify.Web.Core.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookify.Web.Controllers
{
    public class CategoriesController : Controller
    {
        private readonly ApplicationDbContext _context;
        public CategoriesController(ApplicationDbContext context)
        {
            _context = context;
        }
        public IActionResult Index()
        {
            var categories = _context.Categories.AsNoTracking().ToList();
            return View(categories);
        }

        public IActionResult Create()
        {
            return PartialView("_Form");
        }
        [HttpPost]
        [AutoValidateAntiforgeryToken]
        public IActionResult Create(CategoryFormViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View("_Form",model);
            }
            var category = new Category
            {
                Name = model.Name
            };
            _context.Add(category);
            _context.SaveChanges();
            TempData["Message"] = "Saved Successfully";
            return RedirectToAction(nameof(Index));
        }

        [HttpGet]
        public IActionResult Edit(int id)
        {
            var category = _context.Categories.Find(id);
            if (category is null)
            {
                return NotFound();
            }
            var viewModel = new CategoryFormViewModel
            {
                Id = id,
                Name = category.Name
            };
            return View("_Form", viewModel);
        }
        [HttpPost]
        [AutoValidateAntiforgeryToken]
        public IActionResult Edit(CategoryFormViewModel model)
        {
            if (!ModelState.IsValid)
            {
                return View("_Form", model);
            }
            var category = _context.Categories.Find(model.Id);
            if (category is null)
            {
                return NotFound();
            }
           category.Name = model.Name;
            category.LastUpdatedOn = DateTime.Now;
            _context.SaveChanges();
            TempData["Message"] = "Saved Successfully";
            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        public IActionResult ToggleStatus(int id)
        {
            var category = _context.Categories.Find(id);
            if (category is null)
            {
                return NotFound();
            }

            category.IsDeleted = !category.IsDeleted;
            category.LastUpdatedOn = DateTime.Now;
            _context.SaveChanges();

            // Return the new updated time so JS can update UI
            return Ok(category.LastUpdatedOn.ToString());
        }

    }
}
