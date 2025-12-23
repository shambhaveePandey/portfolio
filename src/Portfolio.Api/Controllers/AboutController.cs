using Microsoft.AspNetCore.Mvc;
using Portfolio.Api.Services.Interfaces;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AboutController : ControllerBase
{
    private readonly IAboutService _aboutService;

    public AboutController(IAboutService aboutService) => _aboutService = aboutService;

    [HttpGet]
    public IActionResult Get() => Ok(_aboutService.GetAbout());
}