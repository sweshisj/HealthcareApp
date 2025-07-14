// Backend/Models/Claim.cs
namespace Backend.Models
{
    public class Claim
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Foreign key to User
        public int PolicyId { get; set; } // Which policy this claim is against
        public string ClaimType { get; set; } // E.g., "Medical", "Dental", "Optical"
        public DateTime DateOfService { get; set; }
        public string ProviderName { get; set; }
        public decimal Amount { get; set; }
        public string Description { get; set; } // Details about the claim
        public string Status { get; set; } = "Pending"; // E.g., Pending, Approved, Denied, Under Review
        public DateTime SubmissionDate { get; set; } = DateTime.UtcNow;
        public string DocumentUrl { get; set; } // URL to uploaded documents (receipts, reports)

        // Navigation properties
        public User User { get; set; }
        public Policy Policy { get; set; }
    }
}