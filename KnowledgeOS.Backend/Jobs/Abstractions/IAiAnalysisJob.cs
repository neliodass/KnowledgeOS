namespace KnowledgeOS.Backend.Jobs.Abstractions;

public interface IAiAnalysisJob
{
    Task ProcessAsync(Guid resourceId);
}