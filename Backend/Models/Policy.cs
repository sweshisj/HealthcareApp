namespace Backend.Models
{
    public class Policy
    {
        public int Id { get; set; }
        public int UserId { get; set; } // Foreign key to User
        public string PolicyNumber { get; set; }
        public string CoverageDetails { get; set; } // E.g., "Full Hospital Cover", "Extras Only"
        public decimal Premium { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public string DocumentUrl { get; set; } // Link to a PDF policy document (simulated for now)

        // Navigation property
        public User User { get; set; }
    }
}