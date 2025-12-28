using AutoMapper;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookify.Web.Controllers
{
    public class BookCopiesController : Controller
    {
        private readonly ApplicationDbContext _context;
        private readonly IMapper _mapper;
        public BookCopiesController(ApplicationDbContext context, IMapper mapper)
        {
            _context = context;
            _mapper = mapper;
        }
        public IActionResult Index()
        {
            return View();
        }
        [HttpPost]
        [ValidateAntiForgeryToken]
        public IActionResult ToggleStatus(int id)
        {
            var copy = _context.BookCopies.Find(id);

            if (copy is null)
                return NotFound();

            copy.IsDeleted = !copy.IsDeleted;
            copy.LastUpdatedOn = DateTime.Now;

            _context.SaveChanges();

            return Ok();
        }


    }
}
