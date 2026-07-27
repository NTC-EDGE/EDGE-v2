using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using EDGE.Domain.Entities;

namespace EDGE.Infrastructure.Persistence;

public static class FeedbackDataSeeder
{
    public static async Task SeedAsync(ApplicationDbContext context)
    {
        // If previous seed with literal "Anonymous User" exists, clear it out to re-seed with real names masked on-demand
        var hasOldLiteralAnonSeed = await context.Feedbacks.AnyAsync(f => f.SenderName == "Anonymous User");
        if (hasOldLiteralAnonSeed)
        {
            context.Feedbacks.RemoveRange(await context.Feedbacks.ToListAsync());
            await context.SaveChangesAsync();
        }

        if (await context.Feedbacks.CountAsync() >= 100)
        {
            return;
        }

        var subjects = new[]
        {
            "Amateur Radio Station License Renewal",
            "Field Office Queue Waiting Time",
            "Online Application Portal Speed",
            "Spectrum Inspection Process Feedback",
            "Payment Gateway & E-Receipt Verification",
            "Customer Service & Helpdesk Support",
            "Document Requirement Clarity",
            "Mobile Browser Responsiveness",
            "Radio Operator Exam Booking",
            "Permit Issuance Turnaround Time",
            "General Portal Usability & Design",
            "Clearance Certificate Request",
            "Technical Assistance Helpdesk",
            "Regional Office Facilities & Access",
            "Service Fee Transparency"
        };

        var messages = new[]
        {
            "Extremely smooth application process. Thank you to the NTC Regional team!",
            "The online submission took less than 10 minutes. Very impressed with the speed.",
            "Waiting time at the regional office was a bit long during peak hours, but staff were helpful.",
            "Mobile interface works well, but uploading multi-page PDF documents could be improved.",
            "Received my permit approval faster than expected. Great job on the EDGE system!",
            "Clear guidance notes helped me prepare all requirements in advance.",
            "Payment confirmation was instantaneous. Easy to download the electronic receipt.",
            "Required forms were easy to fill out with the interactive form builder.",
            "Would appreciate push notification updates when application status changes.",
            "Staff at the helpdesk resolved my inquiry within an hour.",
            "Had a minor issue with document re-upload, but support guided me through.",
            "Very transparent breakdown of fees and service requirements.",
            "Seamless experience renewing my commercial radio operator certificate.",
            "The queue tracking feature saved me a lot of time today.",
            "Overall satisfied with the online service portal enhancements."
        };

        var firstNames = new[] { "Juan", "Maria", "Carlos", "Ana", "Jose", "Elena", "Ramon", "Grace", "Mark", "Liza", "Paolo", "Kristine", "Gabriel", "Sophia", "Christian", "Eduardo", "Teresa", "Manuel", "Rosario", "Fernando" };
        var lastNames = new[] { "Dela Cruz", "Santos", "Reyes", "Gonzales", "Bautista", "Aquino", "Villanueva", "Ramos", "Castro", "Mendoza", "Flores", "Navarro", "Garcia", "Torres", "Mercado", "Soriano", "Salazar", "Corpuz" };
        var domains = new[] { "gmail.com", "yahoo.com", "gov.ph", "outlook.com", "company.ph" };
        var statuses = new[] { "Pending", "Reviewed", "Resolved" };

        var newFeedbacks = new List<Feedback>();
        var random = new Random(42); // Fixed seed for reproducible realistic data

        var now = DateTime.UtcNow;

        for (int i = 1; i <= 100; i++)
        {
            bool isAnon = i % 2 == 0; // 50% Anonymous, 50% Named
            string fn = firstNames[random.Next(firstNames.Length)];
            string ln = lastNames[random.Next(lastNames.Length)];
            string senderName = $"{fn} {ln}";
            string senderEmail = $"{fn.ToLower()}.${ln.ToLower().Replace(" ", "")}@{domains[random.Next(domains.Length)]}";

            int rating = random.Next(1, 100) switch
            {
                < 60 => 5, // 60% 5-star
                < 85 => 4, // 25% 4-star
                < 95 => 3, // 10% 3-star
                _ => random.Next(1, 3) // 5% 1-2 star
            };

            var feedback = new Feedback
            {
                Id = Guid.NewGuid(),
                SenderName = senderName,
                SenderEmail = senderEmail,
                Subject = subjects[random.Next(subjects.Length)],
                Message = messages[random.Next(messages.Length)],
                Rating = rating,
                Status = statuses[random.Next(statuses.Length)],
                IsAnonymous = isAnon,
                CreatedAt = now.AddDays(-random.Next(1, 180)).AddHours(-random.Next(1, 24)),
                IsDeleted = false
            };

            newFeedbacks.Add(feedback);
        }

        await context.Feedbacks.AddRangeAsync(newFeedbacks);
        await context.SaveChangesAsync();
    }
}
