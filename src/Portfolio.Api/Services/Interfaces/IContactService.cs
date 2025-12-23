using Portfolio.Api.Models;

namespace Portfolio.Api.Services.Interfaces;

public interface IContactService
{
    Task HandleContactAsync(ContactRequest request);
}