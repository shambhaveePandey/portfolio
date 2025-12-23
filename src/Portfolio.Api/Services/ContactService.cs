using Portfolio.Api.Models;
using Portfolio.Api.Services.Interfaces;

namespace Portfolio.Api.Services;

public class ContactService : IContactService
{
    private readonly ILogger<ContactService> _logger;

    public ContactService(ILogger<ContactService> logger)
    {
        _logger = logger;
    }

    public Task HandleContactAsync(ContactRequest request)
    {
        _logger.LogInformation("Contact from {Name} <{Email}>: {Message}",
            request.Name, request.Email, request.Message);

        return Task.CompletedTask;
    }
}