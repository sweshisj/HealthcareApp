using System;
using Microsoft.Azure.WebJobs;
using Microsoft.Azure.WebJobs.Host;
using Microsoft.Extensions.Logging;
using Azure.Messaging.ServiceBus;
using System.Text.Json;
using System.Threading.Tasks;

// Define a simple Claim model for the Function App (could be shared via a common library)
public class ClaimFunctionModel
{
    public int Id { get; set; }
    public int UserId { get; set; }
    public int PolicyId { get; set; }
    public string ClaimType { get; set; }
    public DateTime DateOfService { get; set; }
    public string ProviderName { get; set; }
    public decimal Amount { get; set; }
    public string Description { get; set; }
    public string Status { get; set; }
    public DateTime SubmissionDate { get; set; }
    public string DocumentUrl { get; set; }
}

namespace ClaimProcessor
{
    public class ProcessClaimFunction
    {
        [FunctionName("ProcessClaimFunction")]
        public async Task Run(
            [ServiceBusTrigger("claimsubmissionqueue", Connection = "ServiceBusConnectionString")] ServiceBusReceivedMessage message,
            ILogger log)
        {
            try
            {
                string messageBody = message.Body.ToString();
                log.LogInformation($"C# ServiceBus queue trigger function processed message: {messageBody}");

                var claim = JsonSerializer.Deserialize<ClaimFunctionModel>(messageBody);

                if (claim != null)
                {
                    log.LogInformation($"Processing Claim ID: {claim.Id}, Type: {claim.ClaimType}, Amount: {claim.Amount}");

                    // Simulate processing delay
                    await Task.Delay(TimeSpan.FromSeconds(5));

                    // --- Simulate Claim Approval/Denial Logic ---
                    // For a simple demo, let's approve claims under $500
                    string newStatus = claim.Amount <= 500 ? "Approved" : "Under Review";
                    log.LogInformation($"Claim ID: {claim.Id} status set to: {newStatus}");

                    log.LogInformation($"Successfully processed claim {claim.Id}. New status: {newStatus}");
                }
            }
            catch (Exception ex)
            {
                log.LogError($"Error processing Service Bus message: {ex.Message}");
                throw; // Re-throw to indicate message processing failed
            }
        }
    }
}