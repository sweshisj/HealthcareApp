// Backend/Controllers/MemberOffersController.cs
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using Backend.Models;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using System;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires authentication
    public class MemberOffersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public MemberOffersController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetMemberOffers()
        {
            var offers = await _context.MemberOffers
                                       .Where(o => o.ExpiryDate >= DateTime.Today) // Only show active offers
                                       .OrderByDescending(o => o.ExpiryDate)
                                       .ToListAsync();

            if (!offers.Any())
            {
                // Seed some dummy offers if none exist for demonstration
                // In a real app, these would come from a CMS or marketing system
                if (await _context.MemberOffers.CountAsync() == 0) // Ensure we don't duplicate on every call
                {
                    var dummyOffers = new List<MemberOffer>
                    {
                        new MemberOffer
                        {
                            Title = "20% off Gym Membership",
                            Description = "Get fit with 20% off annual gym memberships at participating fitness centers.",
                            ExpiryDate = DateTime.Today.AddMonths(3),
                            OfferCode = "FIT2025",
                            ImageUrl = "https://via.placeholder.com/150/0000FF/FFFFFF?text=Gym+Offer"
                        },
                        new MemberOffer
                        {
                            Title = "Free Dental Check-up",
                            Description = "Claim a complimentary dental check-up at selected Bupa Dental clinics.",
                            ExpiryDate = DateTime.Today.AddMonths(1),
                            OfferCode = "DENTALFREE",
                            ImageUrl = "https://via.placeholder.com/150/008000/FFFFFF?text=Dental+Offer"
                        },
                        new MemberOffer
                        {
                            Title = "Wellness Workshop Access",
                            Description = "Exclusive access to online wellness workshops on nutrition and mindfulness.",
                            ExpiryDate = DateTime.Today.AddMonths(6),
                            OfferCode = "WELLNESSHUB",
                            ImageUrl = "https://via.placeholder.com/150/FF0000/FFFFFF?text=Wellness+Offer"
                        }
                    };
                    await _context.MemberOffers.AddRangeAsync(dummyOffers);
                    await _context.SaveChangesAsync();
                    offers.AddRange(dummyOffers);
                }
            }

            return Ok(offers);
        }
    }
}