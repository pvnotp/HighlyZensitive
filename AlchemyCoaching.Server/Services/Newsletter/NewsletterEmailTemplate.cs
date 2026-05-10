namespace AlchemyCoaching.Server.Services
{
    public static class NewsletterEmailTemplate
    {
        public static string GetEmailBody(string email, string siteUrl)
        {
            var signupLink = $"{siteUrl}/newsletter/confirm?email={Uri.EscapeDataString(email)}";
            return $@"
<html>
<body style='font-family: Tenor Sans, sans-serif; color: #808a85; background-color: #002b21; padding: 20px;'>
    <div style='max-width: 600px; margin: 0 auto; background-color: #002b21; padding: 20px; border: 1px solid #808a85; border-radius: 4px; text-align: center;'>
        <p style='margin-bottom: 20px; text-align: center;'>Congratulations on taking the first step on the Path to Purpose.</p>
        <div style='margin: 20px 0; text-align: center;'>
            <a href='https://www.youtube.com/playlist?list=PLxzNQpT-EdQdfIgynQLYdGkHms298VYIl&si=5Mvk7eHBJUb6HSc-' style='color: #d4d6d5; text-decoration: underline; font-weight: 600;'>The Path to Purpose</a>
        </div>
        <p style='margin-bottom: 20px; text-align: center;'>Sign up for the newsletter to continue the journey.</p>
        <div style='text-align: center; margin: 20px 0;'>
            <a href='{signupLink}' style='display: inline-block; background-color: transparent; color: #808a85; border: 1px solid #808a85; padding: 8px 16px; border-radius: 4px; text-decoration: none; font-weight: 600;'>Sign Up</a>
        </div>
    </div>
</body>
</html>
";
        }
    }
}
