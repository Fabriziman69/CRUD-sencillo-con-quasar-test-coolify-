param(
  [string]$InputDocx = 'docs\OPTA1_U2_RA1_Curcert.docx',
  [string]$OutputDirectory = 'docs\qa\render-final'
)
$ErrorActionPreference = 'Stop'
$docxPath = (Resolve-Path -LiteralPath $InputDocx).Path
New-Item -ItemType Directory -Path $OutputDirectory -Force | Out-Null
$outputPath = (Resolve-Path -LiteralPath $OutputDirectory).Path
$pdfPath = Join-Path $outputPath 'documento.pdf'
$wordApp = New-Object -ComObject Word.Application
try {
  $wordApp.Visible = $false
  $wordApp.DisplayAlerts = 0
  $wordDoc = $wordApp.Documents.Open($docxPath, $false, $false)
  $wordDoc.Fields.Update() | Out-Null
  foreach ($toc in $wordDoc.TablesOfContents) { $toc.Update() }
  $wordDoc.Repaginate()
  foreach ($toc in $wordDoc.TablesOfContents) { $toc.UpdatePageNumbers() }
  $wordDoc.Save()
  $wordDoc.ExportAsFixedFormat($pdfPath, 17)
  $pages = $wordDoc.ComputeStatistics(2)
  $wordDoc.Close(0)
  Write-Output "Pages: $pages"
} finally {
  if ($null -ne $wordApp) { $wordApp.Quit(); [Runtime.InteropServices.Marshal]::ReleaseComObject($wordApp) | Out-Null }
}
& 'C:\Users\HP\.cache\codex-runtimes\codex-primary-runtime\dependencies\native\poppler\Library\bin\pdftoppm.exe' -png -r 120 $pdfPath (Join-Path $outputPath 'page')
Write-Output $pdfPath
