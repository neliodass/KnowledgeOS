namespace KnowledgeOS.Backend.Jobs.Abstractions;

public interface IErrorRecoveryJob
{
    Task RecoverAsync();
}