$models = Get-ChildItem -Path "src/infrastructure/database/mongodb/models" -Filter "*.js"

foreach ($modelFile in $models) {
    $content = Get-Content -Path $modelFile.FullName -Raw
    $modelName = $modelFile.BaseName
    
    # Simple regex to replace module.exports = mongoose.model("Name", schema)
    # with the more robust version
    if ($content -match "module\.exports = mongoose\.model\(`"($modelName)`", (\w+)\);") {
        $updatedContent = $content -replace "module\.exports = mongoose\.model\(`"($modelName)`", (\w+)\);", "module.exports = mongoose.models.$1 || mongoose.model(`"$1`", `$2);"
        Set-Content -Path $modelFile.FullName -Value $updatedContent
        Write-Host "Updated $modelName"
    } elseif ($content -match "module\.exports = mongoose\.model\('($modelName)', (\w+)\);") {
        $updatedContent = $content -replace "module\.exports = mongoose\.model\('($modelName)', (\w+)\);", "module.exports = mongoose.models.$1 || mongoose.model('$1', `$2);"
        Set-Content -Path $modelFile.FullName -Value $updatedContent
        Write-Host "Updated $modelName"
    } else {
        Write-Host "Skipping $modelName (pattern not found)"
    }
}
