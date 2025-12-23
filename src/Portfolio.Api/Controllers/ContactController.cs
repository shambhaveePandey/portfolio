using Microsoft.AspNetCore.Mvc;
using Portfolio.Api.Models;
using Portfolio.Api.Services.Interfaces;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ContactController : ControllerBase
{
    private readonly IContactService _contactService;

    public ContactController(IContactService contactService) => _contactService = contactService;

    [HttpPost]
    public async Task<IActionResult> Post([FromBody] ContactRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        await _contactService.HandleContactAsync(request);
        return Ok(new { success = true, message = "Thank you for reaching out!" });
    }
}