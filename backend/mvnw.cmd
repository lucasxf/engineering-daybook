@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF) under one
@REM or more contributor license agreements.  See the NOTICE file
@REM distributed with this work for additional information
@REM regarding copyright ownership.  The ASF licenses this file
@REM to you under the Apache License, Version 2.0 (the
@REM "License"); you may not use this file except in compliance
@REM with the License.  You may obtain a copy of the License at
@REM
@REM    http://www.apache.org/licenses/LICENSE-2.0
@REM
@REM Unless required by applicable law or agreed to in writing,
@REM software distributed under the License is distributed on an
@REM "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
@REM KIND, either express or implied.  See the License for the
@REM specific language governing permissions and limitations
@REM under the License.
@REM ----------------------------------------------------------------------------

@REM ----------------------------------------------------------------------------
@REM Apache Maven Wrapper startup batch script, version 3.3.2
@REM
@REM Optional ENV vars
@REM   MVNW_REPOURL - repo url base for downloading maven distribution
@REM   MVNW_USERNAME/MVNW_PASSWORD - user and password for downloading maven
@REM   MVNW_VERBOSE - true: enable verbose log; others: silence the output
@REM ----------------------------------------------------------------------------

@IF "%__MVNW_ARG0_NAME__%"=="" (SET __MVNW_ARG0_NAME__=%~nx0)
@SET __MVNW_CMD__=
@SET __MVNW_ERROR__=
@SET __MVNW_PSMODULEP_SAVE__=%PSModulePath%
@SET PSModulePath=
@FOR /F "usebackq tokens=1* delims==" %%A IN (`powershell -noprofile "& {$scriptDir='%~dp0'; $script='%__MVNW_ARG0_NAME__%'; icm -ScriptBlock ([Scriptblock]::Create((Get-Content -Raw '%~f0'))) -NoNewScope}"`) DO @(
  IF "%%A"=="MVN_CMD" (set __MVNW_CMD__=%%B) ELSE IF "%%A"=="ERROR" (set __MVNW_ERROR__=%%B)
)
@SET PSModulePath=%__MVNW_PSMODULEP_SAVE__%
@SET __MVNW_PSMODULEP_SAVE__=
@SET __MVNW_ARG0_NAME__=
@SET MVNW_USERNAME=
@SET MVNW_PASSWORD=
@IF NOT "%__MVNW_ERROR__%"=="" (@ECHO.%__MVNW_ERROR__% & @EXIT /b 1)
@IF NOT "%__MVNW_CMD__%"=="" (%__MVNW_CMD__% %*)
@ENDLOCAL & @GOTO :EOF
: end batch / begin powershell #>

$ErrorActionPreference = "Stop"
if ($env:MVNW_VERBOSE -eq "true") {
  $VerbosePreference = "Continue"
}

# calculate distributionUrl, currentDistributionUrl, MAVEN_HOME
$distributionUrl = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/3.9.9/apache-maven-3.9.9-bin.zip"
$hash = [System.BitConverter]::ToString([System.Security.Cryptography.SHA256]::Create().ComputeHash([System.Text.Encoding]::UTF8.GetBytes($distributionUrl))).Replace("-", "").ToLower().Substring(0, 8)
$MAVEN_USER_HOME = if ($env:MAVEN_USER_HOME) { $env:MAVEN_USER_HOME } else { "$env:USERPROFILE\.m2" }
$MAVEN_HOME = "$MAVEN_USER_HOME\wrapper\dists\apache-maven-3.9.9\$hash"
$MVN_CMD = "mvn.cmd"

if (Test-Path -Path "$MAVEN_HOME" -PathType Container) {
  Write-Verbose "found existing MAVEN_HOME at $MAVEN_HOME"
  Write-Output "MVN_CMD=$MAVEN_HOME\bin\$MVN_CMD"
  return
}

# download and unpack maven
Write-Verbose "Couldn't find MAVEN_HOME, downloading and installing it..."
Write-Verbose "Downloading from: $distributionUrl"

$TMP_DOWNLOAD_DIR_HOLDER = New-TemporaryFile
$TMP_DOWNLOAD_DIR = New-Item -ItemType Directory -Path "$TMP_DOWNLOAD_DIR_HOLDER.dir"
$TMP_DOWNLOAD_DIR_HOLDER.Delete() | Out-Null
trap {
  if ($TMP_DOWNLOAD_DIR.Exists) {
    try { Remove-Item $TMP_DOWNLOAD_DIR -Recurse -Force | Out-Null }
    catch { Write-Warning "Cannot remove $TMP_DOWNLOAD_DIR" }
  }
}

New-Item -ItemType Directory -Path "$MAVEN_HOME" -Force | Out-Null

$distributionUrlName = $distributionUrl.Split("/")[-1]
$distributionUrlNameMain = $distributionUrlName.Replace("-bin.zip", "").Replace("-bin.tar.gz", "")
$downloadTarget = "$TMP_DOWNLOAD_DIR\$distributionUrlName"
$wc = New-Object System.Net.WebClient
if ($env:MVNW_USERNAME -and $env:MVNW_PASSWORD) {
  $wc.Credentials = New-Object System.Net.NetworkCredential($env:MVNW_USERNAME, $env:MVNW_PASSWORD)
}
$wc.DownloadFile($distributionUrl, $downloadTarget)

# unzip and move
Expand-Archive -Path $downloadTarget -DestinationPath $TMP_DOWNLOAD_DIR
Copy-Item -Path "$TMP_DOWNLOAD_DIR\$distributionUrlNameMain\*" -Destination $MAVEN_HOME -Recurse

Write-Output "MVN_CMD=$MAVEN_HOME\bin\$MVN_CMD"
