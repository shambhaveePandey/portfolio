using Portfolio.Api.Models;

namespace Portfolio.Api.Services.Interfaces;

public interface IProjectService
{
    IEnumerable<Project> GetAll();
    Project? GetById(int id);
}