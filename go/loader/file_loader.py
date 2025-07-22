import json
import os

with open('./go_config.json', 'r') as f:
    redirects = json.load(f)

html_template = """<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title}</title>
    <link rel="stylesheet" href="./style.css">

    <meta property="author" content="Vensin">
    <meta property="og:title" content="{title}">
    <meta property="og:description" content="{description}">
    <meta property="og:url" content="{url}" id="og-url">
    <meta property="og:image" content="{image}">
    <meta property="og:type" content="website">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{title}">
    <meta name="twitter:description" content="{description}">
    <meta name="twitter:image" content="{image}">
    <meta name="twitter:url" content="{url}" id="twitter-url">
    <link rel="canonical" href="{url}">
    <script>
        function redirect() {{
            const redirectUrl = "{url}";
            document.getElementById("og-url").setAttribute("content", redirectUrl);
            document.getElementById("twitter-url").setAttribute("content", redirectUrl);
            window.location.href = redirectUrl;
            document.getElementById("message").innerHTML = 'Wenn du nicht automatisch weitergeleitet wirst.';
            document.getElementById("back").style.display = 'none';
            document.getElementById("manualRedirect").style.display = 'inline-block';
            document.getElementById("manualRedirect").setAttribute("href", redirectUrl);
        }}
        window.onload = redirect;
    </script>
</head>
<body>
    <div class="container">
        <p id="message">Wenn du nicht automatisch weitergeleitet wirst, überprüfe bitte die URL.</p>
        <a href="/" id="back" class="btn">Zurück zur Startseite</a>
        <a id="manualRedirect" class="btn" style="display: none;">Klick hier</a>
    </div>
</body>
</html>
"""

output_directory = '../'

existing_files = set(os.listdir(output_directory))

for redirect in redirects:
    html_content = html_template.format(
        title=redirect['title'],
        description=redirect['description'],
        url=redirect['url'],
        image=redirect['image'],
    )
    
    with open(os.path.join(output_directory, redirect['filename']), 'w', encoding='utf-8') as f:
        f.write(html_content)

for filename in existing_files:
    if filename.endswith('.html') and filename != 'style.css':
        if not any(redirect['filename'] == filename for redirect in redirects):
            os.remove(os.path.join(output_directory, filename))
            print(f"Deleted: {filename}")

print("HTML files generated/updated successfully.")
