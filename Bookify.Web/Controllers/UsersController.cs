using AutoMapper;
using Bookify.Web.Core.Consts;
using Bookify.Web.Core.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Bookify.Web.Controllers
{
    [Authorize(Roles = AppRoles.Admin)]
    public class UsersController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IMapper _mapper;
        public UsersController(UserManager<ApplicationUser> userManager, IMapper mapper)
        {
            _userManager = userManager;
            _mapper = mapper;
        }
        public async Task<IActionResult> Index()
        {
            var users = await _userManager.Users.ToListAsync();
            var viewModel = _mapper.Map<IEnumerable<UserViewModel>>(users);
            return View(viewModel);
        }
    }
}
