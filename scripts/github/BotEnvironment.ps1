Set-StrictMode -Version Latest

function New-BotEnvironmentContent {
    [CmdletBinding()]
    param(
        [System.Collections.IDictionary] $Values
    )

    $mappings = [ordered]@{
        BOT_PORT                          = 'port'
        DISCORD_TOKEN                    = 'discord__token'
        DISCORD__GUILD_ID                 = 'discord__guild_id'
        DISCORD__LOGGING_CHANNEL_ID       = 'discord__logging_channel_id'
        DISCORD__WEATHER_UPDATE_CHANNEL_ID = 'discord__weather_update_channel_id'
        DATABASE__HOST                    = 'database__host'
        DATABASE__PORT                    = 'database__port'
        DATABASE__USERNAME                = 'database__username'
        DATABASE__PASSWORD                = 'database__password'
        DATABASE__DATABASE_NAME                    = 'database__database_name'
        GIPHY__APIKEY                     = 'giphy__apiKey'
        SIMGRID__URL                       = 'simgrid__url'
        SIMGRID__TOKEN                     = 'simgrid__token'
        OPENGAMEPANEL__IP                = 'openGamePanel__ip'
        OPENGAMEPANEL__API_TOKEN         = 'openGamePanel__api_token'
        OPENGAMEPANEL__AUTHORIZATION_TOKEN = 'openGamePanel__authorization_token'
        OPENWEATHERAPI__TOKEN            = 'openWeatherApi__token'
        OPENAI__APIKEY                    = 'openai__apiKey'
    }

    $resolvedValues = [ordered]@{}
    foreach ($name in $mappings.Keys) {
        if ($null -eq $Values) {
            $resolvedValues[$name] = [Environment]::GetEnvironmentVariable($name)
        }
        elseif ($Values.Contains($name)) {
            $resolvedValues[$name] = $Values[$name]
        }
        else {
            $resolvedValues[$name] = $null
        }
    }

    $hasConfiguredValue = $false
    foreach ($name in $mappings.Keys) {
        $value = $resolvedValues[$name]
        if ($null -ne $value -and ([string] $value).Length -gt 0) {
            $hasConfiguredValue = $true
            break
        }
    }
    if (-not $hasConfiguredValue) {
        return $null
    }

    $missingNames = @(
        foreach ($name in $mappings.Keys) {
            if ([string]::IsNullOrWhiteSpace([string] $resolvedValues[$name])) {
                $name
            }
        }
    )
    if ($missingNames.Count -gt 0) {
        throw "Missing required bot environment secrets: $($missingNames -join ', ')."
    }

    $lines = @("env='production'")
    foreach ($name in $mappings.Keys) {
        $value = [string] $resolvedValues[$name]
        if ($value.IndexOfAny([char[]] @([char] 0, [char] 10, [char] 13)) -ge 0) {
            throw "Bot environment secret '$name' contains an unsupported line break or NUL character."
        }

        $delimiter = $null
        foreach ($candidate in @([char] 39, [char] 34, [char] 96)) {
            if ($value.IndexOf($candidate) -ge 0) {
                continue
            }
            if ($candidate -eq [char] 34 -and ($value.Contains('\n') -or $value.Contains('\r'))) {
                continue
            }
            $delimiter = $candidate
            break
        }
        if ($null -eq $delimiter) {
            throw "Bot environment secret '$name' cannot be represented safely in dotenv format."
        }

        $lines += $mappings[$name] + '=' + $delimiter + $value + $delimiter
    }

    return ($lines -join "`n") + "`n"
}
