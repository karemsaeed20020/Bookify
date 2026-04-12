using Bookify.Web.Core.Consts;
using Bookify.Web.Services;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.EntityFrameworkCore;

namespace Bookify.Web.Tasks
{
    public class HangfireTasks
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _webHostEnvironment;
        private readonly IEmailSender _emailSender;
        private readonly IEmailBodyBuilder _emailBodyBuilder;
        public HangfireTasks(ApplicationDbContext context, IWebHostEnvironment webHostEnvironment, IEmailSender emailSender, IEmailBodyBuilder emailBodyBuilder)
        {
            _context = context;
            _webHostEnvironment = webHostEnvironment;
            _emailSender = emailSender;
            _emailBodyBuilder = emailBodyBuilder;
        }
        public async Task PrepareExpirationAlert()
        {
            var subscribers = _context.Subscripers.Include(s => s.Subscriptions)
                .Where(s => !s.IsBlackListed && s.Subscriptions.OrderByDescending(x => x.EndDate).First().EndDate == DateTime.Today.AddDays(5)).ToList();

            foreach (var subscriber in subscribers)
            {
                var endDate = subscriber.Subscriptions.Last().EndDate.ToString("d MMM, yyyy");
                var placeholders = new Dictionary<string, string>()
                {
                    { "imageUrl", "https://res.cloudinary.com/devcreed/image/upload/v1671062674/calender_zfohjc.png" },
                    { "header", $"Hello {subscriber.FirstName}," },
                    { "body", $"your subscription will expire on {endDate} 😟, please renew it to keep enjoying our services." }
                };
                var body = _emailBodyBuilder.GetEmailBody(EmailTemplates.Notification, placeholders);
                await _emailSender.SendEmailAsync(
                    subscriber.Email,
                    "Bookify Subscription Expiration Alert", body);
            }
        }
    }
}
