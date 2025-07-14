// Backend/Controllers/ClaimsController.cs
using Microsoft.AspNetCore.Mvc;
using Backend.Data;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Backend.Models;
using Azure.Messaging.ServiceBus; // For Azure Service Bus

namespace Backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class ClaimsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ServiceBusSender _serviceBusSender;
        private readonly ILogger<ClaimsController> _logger;

        public ClaimsController(ApplicationDbContext context, ServiceBusSender serviceBusSender, ILogger<ClaimsController> logger)
        {
            _context = context;
            _serviceBusSender = serviceBusSender;
            _logger = logger;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserClaims()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            var claims = await _context.Claims
                                       .Where(c => c.UserId == userId)
                                       .OrderByDescending(c => c.SubmissionDate)
                                       .ToListAsync();
            return Ok(claims);
        }

        [HttpPost]
        public async Task<IActionResult> SubmitClaim(ClaimDto request)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null || !int.TryParse(userIdClaim.Value, out int userId))
            {
                return Unauthorized("User ID not found in token.");
            }

            // Basic validation
            var policy = await _context.Policies.FirstOrDefaultAsync(p => p.Id == request.PolicyId && p.UserId == userId);
            if (policy == null)
            {
                return BadRequest("Invalid policy ID for the current user.");
            }

            var newClaim = new Backend.Models.Claim
            {
                UserId = userId,
                PolicyId = request.PolicyId,
                ClaimType = request.ClaimType,
                DateOfService = request.DateOfService,
                ProviderName = request.ProviderName,
                Amount = request.Amount,
                Description = request.Description,
                DocumentUrl = request.DocumentUrl // Placeholder for now, later integrate actual file upload
            };

            _context.Claims.Add(newClaim);
            await _context.SaveChangesAsync();

            // --- Integrate Azure Service Bus for asynchronous processing ---
            try
            {
                var claimMessage = new ServiceBusMessage(System.Text.Json.JsonSerializer.Serialize(newClaim));
                await _serviceBusSender.SendMessageAsync(claimMessage);
                _logger.LogInformation($"Claim {newClaim.Id} submitted and sent to Service Bus.");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to send claim {newClaim.Id} to Service Bus.");
                // In a real app, you'd handle this failure, e.g., re-try, dead-letter queue, etc.
            }

            return StatusCode(201, newClaim); // Return 201 Created with the new claim
        }

        // DTO for incoming claim data
        public class ClaimDto
        {
            public int PolicyId { get; set; }
            public string ClaimType { get; set; }
            public DateTime DateOfService { get; set; }
            public string ProviderName { get; set; }
            public decimal Amount { get; set; }
            public string Description { get; set; }
            public string DocumentUrl { get; set; }
        }
    }
}