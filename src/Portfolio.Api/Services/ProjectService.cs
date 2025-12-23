using Portfolio.Api.Models;
using Portfolio.Api.Services.Interfaces;

namespace Portfolio.Api.Services;

public class ProjectService : IProjectService
{
    private readonly List<Project> _projects = new()
    {
        new Project
        {
            Id = 1,
            Title = "Portfolio Website",
            Description = "Personal portfolio built with HTML, CSS, JS and .NET API.",
            Link = "https://your-portfolio-link",
            Tags = new List<string>{ "Web", "C#", ".NET" }
        },
        new Project
        {
            Id = 2,
            Title = "API Demo",
            Description = "Sample REST API with ASP.NET Core.",
            Link = "https://github.com/yourname/api-demo",
            Tags = new List<string>{ "API", "REST" }
        }
    };

    public IEnumerable<Project> GetAll() => _projects;

    public Project? GetById(int id) => _projects.FirstOrDefault(p => p.Id == id);
}