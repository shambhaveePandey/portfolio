namespace Portfolio.Api.Models;

public class Project
{
    public int Id { get; set; }
    public required string Title { get; set; }
    public required string Description { get; set; }
    public string? Link { get; set; }
    public string? Image { get; set; }
    public List<string> Technologies { get; set; } = new();
    public string? GitHub { get; set; }
}