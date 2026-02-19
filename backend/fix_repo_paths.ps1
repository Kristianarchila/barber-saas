$repositories = Get-ChildItem -Path "src/infrastructure/database/mongodb/repositories" -Filter "*.js"

foreach ($repo in $repositories) {
    $content = Get-Content -Path $repo.FullName -Raw
    # Change require('../../models/...') to require('../models/...')
    if ($content -match "require\('\.\./\.\./models/") {
        $updatedContent = $content -replace "require\('\.\./\.\./models/", "require('../models/"
        Set-Content -Path $repo.FullName -Value $updatedContent
        Write-Host "Fixed path in $($repo.Name)"
    }
}
