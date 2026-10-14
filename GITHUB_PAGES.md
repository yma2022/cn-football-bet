# Deploying to GitHub Pages

The workflow in `.github/workflows/deploy-pages.yml` builds the Vite application and publishes `dist/` whenever `main` is pushed. It uses a relative Vite base path so the site works beneath a repository URL such as `/cn-football-bet/`.

## Privacy-safe one-time setup

Do not push this repository's existing Git history to a public GitHub repository. Earlier local commits may contain infrastructure identifiers. Instead, create a fresh one-commit export. The `.gitattributes` file automatically excludes the Terraform directory and internal hosting metadata from this export.

1. From this repository's root, create a privacy-safe snapshot in a new temporary directory:

   ```powershell
   $publicDir = Join-Path $env:TEMP ("cn-football-bet-public-" + [guid]::NewGuid())
   $publicZip = "$publicDir.zip"
   git archive --format=zip --output=$publicZip HEAD
   Expand-Archive -LiteralPath $publicZip -DestinationPath $publicDir
   Set-Location $publicDir
   git init -b main
   git add .
   git commit -m "Initial public release"
   ```

2. Create and push a public repository, replacing `<GITHUB_OWNER>` with your GitHub username or organization:

   ```powershell
   gh repo create <GITHUB_OWNER>/cn-football-bet --public --source=. --remote=origin --push
   ```

3. On GitHub, open **Settings → Pages**. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Open the **Actions** tab and wait for **Deploy to GitHub Pages** to finish.

The expected site URL is:

```text
https://<GITHUB_OWNER>.github.io/cn-football-bet/
```

Every later push to `main` automatically rebuilds and republishes the site. You can also run the workflow manually from the Actions tab.

GitHub Pages is public. The application's leaderboard remains local to each browser because it is stored in `localStorage`.
