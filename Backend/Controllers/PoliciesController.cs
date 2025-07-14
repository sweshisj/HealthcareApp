using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.Models;

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize] // Requires authentication for all actions in this controller
    public class PoliciesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public PoliciesController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserPolicies()
        {
            // Get the user ID from the JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var policies = await _context.Policies
                                         .Where(p => p.UserId == userId)
                                         .ToListAsync();

            if (!policies.Any())
            {
                // For demonstration, let's create a dummy policy if none exist
                // In a real app, policies would be loaded from a system
                var user = await _context.Users.FindAsync(userId);
                if (user != null)
                {
                    var dummyPolicy = new Policy
                    {
                        UserId = userId,
                        PolicyNumber = $"P{DateTime.Now.Ticks.ToString().Substring(0, 10)}",
                        CoverageDetails = "Standard Hospital & Extras Cover",
                        Premium = 250.00m,
                        StartDate = DateTime.Today.AddYears(-1),
                        EndDate = DateTime.Today.AddYears(1),
                        DocumentUrl = "https://example.com/dummy-policy.pdf" // Placeholder
                    };
                    _context.Policies.Add(dummyPolicy);
                    await _context.SaveChangesAsync();
                    policies.Add(dummyPolicy); // Add to the list to return
                }
            }

            return Ok(policies);
        }

        // You could add POST, PUT, DELETE methods here for admin functionality,
        // but for a user portal, read-only is typical for policies.
    }
}