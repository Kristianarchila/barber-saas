$modelsDir = "src/infrastructure/database/mongodb/models"
$files = Get-ChildItem -Path $modelsDir -Filter "*.js"

foreach ($file in $files) {
    $content = Get-Content -Path $file.FullName -Raw
    $modelName = $file.BaseName
    
    # Try to find the schema variable name (it's usually [modelNameLower]Schema)
    if ($content -match "const (\w+Schema) = new mongoose\.Schema") {
        $schemaVar = $matches[1]
        
        # Look for the broken line: module.exports = mongoose.models. || mongoose.model("", userSchema);
        # Or any variation of it at the end of the file.
        # We'll just replace the last part of the file after the last closing brace and any methods/statics.
        
        $newExport = "module.exports = mongoose.models.$modelName || mongoose.model('$modelName', $schemaVar);"
        
        # Replace the broken module.exports line
        $updatedContent = $content -replace "module\.exports = mongoose\.models\.\s*\|\| mongoose\.model\(`"`", \w+\);", $newExport
        $updatedContent = $updatedContent -replace "module\.exports = mongoose\.models\.\s*\|\| mongoose\.model\('', \w+\);", $newExport
        
        # Special case for files that were ALREADY in the correct format or slightly different
        if ($updatedContent -eq $content) {
            Write-Host "No change for $modelName - already correct or pattern not found"
        } else {
            Set-Content -Path $file.FullName -Value $updatedContent
            Write-Host "Fixed $modelName"
        }
    } else {
        Write-Host "Could not find schema variable for $modelName"
    }
}
