using Microsoft.AspNetCore.Mvc;
using Portfolio.Api.Services.Interfaces;

namespace Portfolio.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ProjectsController : ControllerBase
{
    private readonly IProjectService _projectService;

    public ProjectsController(IProjectService projectService) => _projectService = projectService;

    [HttpGet]
    public IActionResult GetAll() => Ok(_projectService.GetAll());

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id)
    {
        var project = _projectService.GetById(id);
        if (project is null) return NotFound();
        return Ok(project);
    }
}