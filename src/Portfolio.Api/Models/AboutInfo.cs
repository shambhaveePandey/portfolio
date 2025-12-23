namespace Portfolio.Api.Models;

public class AboutInfo
{
    public required string Name { get; set; }
    public required string Title { get; set; }
    public required string Summary { get; set; }
    public string? Location { get; set; }
}