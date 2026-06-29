 = 'C:\Users\user\.gemini\antigravity\brain\7382431b-0d1f-4ccb-b700-14a73cf63161\.system_generated\logs\transcript_full.jsonl'
 = Get-Content -Path 
 = New-Object System.Text.StringBuilder

 = @(
  @{start=1; end=800},
  @{start=801; end=1600},
  @{start=1601; end=2400},
  @{start=2401; end=3200},
  @{start=3201; end=3268}
)

foreach ( in ) {
   = 'Showing lines ' + .start + ' to ' + .end
   = False
  for ( = .Length - 1;  -ge 0; --) {
     = []
    if ( -like '*' +  + '*') {
       = ConvertFrom-Json 
       = .content
       =  -split '
'
      foreach ( in ) {
        if ( -match '^\d+: (.*)$') {
          [void].AppendLine([1])
        }
      }
       = True
      Write-Host 'Found range ' .start '-' .end 'in step' .step_index
      break
    }
  }
  if (-not ) {
    Write-Warning 'Could not find range ' + .start + '-' + .end
  }
}

 = .ToString()
if (.Length -gt 1000) {
  Set-Content -Path 'main.js' -Value  -Encoding utf8
  Write-Host 'Success! main.js restored.'
} else {
  Write-Error 'Failed to restore main.js'
}
