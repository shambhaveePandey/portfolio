using Portfolio.Api.Models;
using Portfolio.Api.Services.Interfaces;

namespace Portfolio.Api.Services;

public class AboutService : IAboutService
{
    public AboutInfo GetAbout() =>
        new()
        {
            Name = "Shambhavee Pandey",
            Title = "Full-Stack Developer",
            Summary = "Developer focused on .NET, web and cloud.",
            Location = "London, UK"
        };
}