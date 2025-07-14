// Backend/Models/MemberOffer.cs
namespace Backend.Models
{
    public class MemberOffer
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public DateTime ExpiryDate { get; set; }
        public string OfferCode { get; set; } // Optional: for redemption
        public string ImageUrl { get; set; } // Optional: link to an offer image
    }
}