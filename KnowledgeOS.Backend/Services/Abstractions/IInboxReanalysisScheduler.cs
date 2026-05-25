namespace KnowledgeOS.Backend.Services.Abstractions;

public interface IInboxReanalysisScheduler
{
    Task ScheduleForUserAsync(string userId, int maxItems = 20);
}
