namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IUrlIngestionJob
{
    Task ProcessAsync(Guid resourceId);
}