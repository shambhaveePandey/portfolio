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
            Title = "E-Commerce Platform",
            Description = "A full-stack e-commerce solution with real-time inventory management, secure payment processing, and advanced product filtering.",
            Image = "https://via.placeholder.com/400x200?text=E-Commerce+Platform",
            Technologies = new List<string> { "React", "Node.js", "MongoDB", "Stripe" },
            Link = "https://example-ecommerce.com",
            GitHub = "https://github.com/yourusername/ecommerce-platform"
        },
        new Project
        {
            Id = 2,
            Title = "Task Management App",
            Description = "A collaborative task management application with real-time updates, team workspaces, and integrated notifications.",
            Image = "https://via.placeholder.com/400x200?text=Task+Management",
            Technologies = new List<string> { "Vue.js", "Express", "PostgreSQL", "Socket.io" },
            Link = "https://example-tasks.com",
            GitHub = "https://github.com/yourusername/task-manager"
        }
    };

    public IEnumerable<Project> GetAll() => _projects;
    public Project? GetById(int id) => _projects.FirstOrDefault(p => p.Id == id);
}